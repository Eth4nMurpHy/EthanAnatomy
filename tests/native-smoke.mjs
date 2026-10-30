import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
const base = "http://127.0.0.1:4444";
let session;
async function request(route, body, method = "POST") {
  const r = await fetch(base + route, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await r.json();
  assert.ok(r.ok && !data.value?.error, JSON.stringify(data));
  return data.value;
}
const run = (script) =>
  request(`/session/${session}/execute/sync`, { script, args: [] });
async function wait(script, message) {
  const end = Date.now() + 120000;
  while (Date.now() < end) {
    const error = await run(
      'return document.querySelector(".load-panel.error")?.textContent || ""',
    );
    assert.equal(error, "", error);
    if (await run(script)) return;
    await delay(300);
  }
  throw Error(message);
}
try {
  const app = process.env.TAURI_APP_PATH;
  if (!app) throw Error("Set TAURI_APP_PATH to the built native executable");
  session = (
    await request("/session", {
      capabilities: { alwaysMatch: { "tauri:options": { application: app } } },
    })
  ).sessionId;
  await wait(
    'return document.querySelector(".library-footer")?.textContent.includes("已加载")',
    "Native male model failed to load",
  );
  assert.equal(await run("return document.title"), "人体学习工作台 · 开发版");
  await run(
    'const input=document.querySelector(".structure-search input");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"心脏");input.dispatchEvent(new Event("input",{bubbles:true}));',
  );
  await wait(
    'return !!document.querySelector(".structure-result")',
    "Native search failed",
  );
  await run('document.querySelector(".structure-result").click()');
  await wait(
    'return /heart/i.test(document.querySelector(".selected-name")?.textContent || "")',
    "Native structure selection failed",
  );
  await run(
    'document.querySelector(".primary-action").click();document.querySelector(".selection-actions button:last-child").click()',
  );
  await wait(
    'return document.querySelector(".selection-actions button:last-child")?.textContent.includes("已收藏")',
    "Native bookmark failed",
  );
  await request(`/session/${session}/refresh`, {});
  await wait(
    'return document.querySelector(".library-footer")?.textContent.includes("已加载")',
    "Native reload failed",
  );
  assert.ok(
    await run(
      'return document.querySelector(".library-tabs button:last-child")?.textContent.includes("1")',
    ),
    "Bookmark persisted",
  );
  await run(
    'const select=document.querySelector(".model-picker select");select.value="female";select.dispatchEvent(new Event("change",{bubbles:true}));',
  );
  await wait(
    'return document.querySelector(".model-picker select")?.value==="female" && document.querySelector(".library-footer")?.textContent.includes("2,245")',
    "Native female model failed to load",
  );
  assert.ok(
    await run('return !!document.querySelector(".model-viewport canvas")'),
  );
  await run('document.querySelector(".about-button").click()');
  await wait(
    'return !!document.querySelector(".about-dialog")',
    "Native credits failed",
  );
  assert.match(
    await run('return document.querySelector(".about-dialog").textContent'),
    /React.*TypeScript.*Three.js/,
  );
  console.log(
    "Native workspace passed: both models, source search, selection/focus, bookmark persistence and attribution.",
  );
} finally {
  if (session) await request(`/session/${session}`, undefined, "DELETE");
}
