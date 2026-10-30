import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {createServer} from 'vite';

// Observe the real Three.js camera in the browser response only; no debug API
// or test-specific behavior is added to the shipped application.
const server = await createServer({server: {host: '127.0.0.1', port: 0, strictPort: true}});
let browser;
try {
  await server.listen();
  const port = server.httpServer.address().port;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({viewport: {width: 1280, height: 900}, reducedMotion: 'reduce'});
  page.setDefaultTimeout(30_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('human-atlas.language', 'en'));
  await page.route(/\/app\/scene\.tsx(?:\?.*)?$/, async route => {
    const response = await route.fetch();
    let source = await response.text();
    assert.match(source, /new T\.PerspectiveCamera\([^)]*\)/);
    assert.match(source, /new OrbitControls\([^)]*\)/);
    source = source.replace(/new T\.PerspectiveCamera\(([^)]*)\)/, '(window.__camera = new T.PerspectiveCamera($1))')
      .replace(/new OrbitControls\(([^)]*)\)/, '(window.__controls = new OrbitControls($1))');
    await route.fulfill({response, body: source});
  });
  await page.goto(`http://127.0.0.1:${port}/?model=male#explore`);
  await page.waitForFunction(() => document.querySelector('.header-random')?.disabled === false, {}, {timeout: 120_000});
  const settle = async () => {
    await page.evaluate(() => { window.__cameraStability = null; });
    await page.waitForFunction(() => {
      const camera = window.__camera, controls = window.__controls;
      if (!camera || !controls) return false;
      const pose = JSON.stringify([...camera.position.toArray(), ...camera.quaternion.toArray(), ...controls.target.toArray()].map(value => Math.round(value * 1e8) / 1e8));
      if (window.__cameraStability?.pose !== pose) window.__cameraStability = {pose, since: Date.now()};
      return Date.now() - window.__cameraStability.since > 600;
    }, {}, {timeout: 120_000});
  };
  const snapshot = () => page.evaluate(() => [
    ...window.__camera.position.toArray(), ...window.__camera.quaternion.toArray(),
    ...window.__controls.target.toArray(), window.__camera.zoom,
  ]);
  const customPose = async () => {
    await page.evaluate(() => {
      const camera = window.__camera, controls = window.__controls;
      controls.enableDamping = false;
      controls.autoRotate = false;
      controls.update();
      camera.position.set(1.4, 1.25, 2.1);
      controls.target.set(0.12, 0.9, 0.04);
      controls.update();
      controls.enableDamping = true;
    });
    await settle();
    return snapshot();
  };
  const delta = (before, after) => Math.max(...before.map((value, index) => Math.abs(value - after[index])));
  const unchanged = async (before, message) => {
    await settle();
    const difference = delta(before, await snapshot());
    assert.ok(difference < 0.00001, `${message}: camera changed by ${difference}`);
    console.log(`Passed: ${message}`);
  };
  const muscles = page.getByRole('switch', {name: 'Show Muscles', exact: true});
  let before = await customPose();
  await muscles.setChecked(false);
  await unchanged(before, 'hiding muscles preserves a rotated and zoomed camera');
  await muscles.setChecked(true);
  await settle();
  await page.locator('.header-random').click();
  await page.getByRole('button', {name: 'Locate structure', exact: true}).click();
  await settle();
  before = await customPose();
  await muscles.setChecked(false);
  await unchanged(before, 'hiding muscles after focusing a structure preserves the camera');
  assert.equal(await page.locator('.detail-sheet').count(), 0, 'Layer changes still clear the previous structure details');
  before = await customPose();
  await page.locator('.sidebar-toggle').click();
  await unchanged(before, 'closing the sidebar preserves the camera');
  await page.setViewportSize({width: 1100, height: 820});
  await unchanged(before, 'resizing the viewport preserves the camera');
  await page.locator('.sidebar-toggle').click();
  await muscles.setChecked(true);
  await page.getByRole('button', {name: 'Separate', exact: true}).click();
  await settle();
  before = await customPose();
  await muscles.setChecked(false);
  await unchanged(before, 'hiding muscles in the separated layout preserves the camera');
  await page.getByRole('button', {name: 'Reset view', exact: true}).click();
  await settle();
  assert.ok(delta(before, await snapshot()) > 0.01, 'Explicit reset must still move the camera');
  assert.equal(await muscles.isChecked(), false, 'Reset view must retain layer visibility');
  console.log('Passed: explicit reset changes the camera and retains hidden layers');
  assert.deepEqual(errors, [], 'The viewer must not raise browser runtime errors');
  console.log('Camera browser regressions passed.');
} finally {
  await browser?.close();
  await server.close();
}
