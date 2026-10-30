import assert from 'node:assert/strict';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

// Start tauri-driver inside an X11/Wayland session before running this script.
// This tests the embedded desktop assets and IPC, without a Vite server.
const driver = process.env.WEBDRIVER_URL || 'http://127.0.0.1:4444';
const application = path.resolve(process.env.TAURI_APP_PATH || 'src-tauri/target/x86_64-unknown-linux-gnu/release/anatolume');
async function request(route, body, method = 'POST') {
  const response = await fetch(driver + route, {
    method, headers: {'Content-Type': 'application/json'},
    ...(body === undefined ? {} : {body: JSON.stringify(body)}),
  });
  const result = await response.json();
  assert.ok(response.ok && !result.value?.error, JSON.stringify(result));
  return result.value;
}
let session;
const execute = script => request(`/session/${session}/execute/sync`, {script, args: []});
const executeAsync = script => request(`/session/${session}/execute/async`, {script, args: []});
async function waitFor(script, message) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const error = await execute('return document.querySelector(".loading.error")?.textContent || ""');
    assert.equal(error, '', 'Native viewer failed: ' + error);
    if (await execute(script)) return;
    await delay(250);
  }
  throw Error(message);
}
try {
  const created = await request('/session', {capabilities: {alwaysMatch: {'tauri:options': {application}}}});
  session = created.sessionId;
  await request(`/session/${session}/timeouts`, {script: 120_000});
  await waitFor('return !!document.querySelector("#atlas-model")', 'Desktop interface did not start');
  await execute('localStorage.setItem("anatolume.check-updates", "off")');
  await request(`/session/${session}/refresh`, {});
  await waitFor('return !!document.querySelector("#atlas-model")', 'Desktop interface did not reload');
  // The ordinary binary and DEB must not offer an AppImage replacement.
  assert.equal(await executeAsync('const done = arguments[arguments.length - 1]; window.__TAURI_INTERNALS__.invoke("updates_supported").then(done);'), process.env.TAURI_EXPECT_APPIMAGE === "1");
  if (process.env.TAURI_EXPECT_APPIMAGE !== '1') assert.equal(await executeAsync('const done = arguments[arguments.length - 1]; window.__TAURI_INTERNALS__.invoke("check_update").then(() => done("unexpected"), done);'), 'unsupported_package');
  for (const model of ['male', 'female']) {
    await execute(`const select = document.querySelector('#atlas-model'); select.value = '${model}'; select.dispatchEvent(new Event('change', {bubbles: true}));`);
    await waitFor(`return document.querySelector('#atlas-model')?.value === '${model}' && !!document.querySelector('canvas') && document.querySelector('.header-random')?.disabled === false`, `${model} model did not load`);
    const manifest = model === 'male' ? 'atlas.json' : 'atlas-female.json';
    const catalogue = await executeAsync(`const done = arguments[arguments.length - 1]; fetch('/models/${manifest}').then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(a => done({parts: a.parts.length, chunks: a.chunks.length})).catch(e => done({error: String(e)}));`);
    assert.ok(catalogue.parts > 2000 && catalogue.chunks > 0, JSON.stringify(catalogue));
    await execute('document.querySelector(".header-random").click()');
    await waitFor('return !!document.querySelector(".detail-sheet")', 'Structure details did not open');
    console.log(`Native ${model}: embedded atlas (${catalogue.parts} parts), WebGL canvas, complete model loading and structure selection passed.`);
  }
  await execute('const select = document.querySelector("#atlas-language"); select.value = "en"; select.dispatchEvent(new Event("change", {bubbles:true}));');
  await waitFor('return document.documentElement.lang === "en"', 'English language did not apply');
  await request(`/session/${session}/refresh`, {});
  await waitFor('return document.querySelector("#atlas-language")?.value === "en" && document.querySelector("#atlas-model")?.value === "female"', 'Preferences did not survive reload');
  await waitFor('return document.querySelector(".header-random")?.disabled === false', 'Female model did not finish reloading');
  await execute('document.querySelector(".header-search").click()');
  await waitFor('return !!document.querySelector("input[role=combobox]")', 'Search input did not open');
  await execute(`const input = document.querySelector('input[role=combobox]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'heart'); input.dispatchEvent(new Event('input', {bubbles:true}));`);
  await waitFor('return [...document.querySelectorAll(".search-result-name")].some(el => /heart/i.test(el.textContent))', 'Heart search returned no native results');
  await execute('document.querySelector(".search-result").click()');
  await waitFor('return /heart/i.test(document.querySelector(".detail-sheet")?.textContent || "")', 'Search result did not open heart details');
  await execute('document.querySelector(".about-nav").click()');
  await waitFor('return !!document.querySelector(".credits-sheet")', 'About panel did not open');
  assert.equal(await execute('return !!document.querySelector(".update-card")'), process.env.TAURI_EXPECT_APPIMAGE === '1');
  console.log('Native search, detail panel and package-specific update controls passed.');
  console.log('Native IPC package restrictions and saved language/model preferences passed.');
} finally {
  if (session) await request(`/session/${session}`, undefined, 'DELETE');
}
