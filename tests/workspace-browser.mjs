import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright-core";
import { createServer } from "vite";
const server = await createServer({
  server: { host: "127.0.0.1", port: 0, strictPort: true },
});
let browser;
try {
  await server.listen();
  const port = server.httpServer.address().port;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/\/studio\/Viewer\.tsx(?:\?.*)?$/, async (route) => {
    const response = await route.fetch();
    let source = await response.text();
    assert.match(source, /new T\.PerspectiveCamera\(/);
    source = source
      .replace(
        /new T\.PerspectiveCamera\(([^)]*)\)/,
        "(window.__camera = new T.PerspectiveCamera($1))",
      )
      .replace(
        /new OrbitControls\(([^)]*)\)/,
        "(window.__controls = new OrbitControls($1))",
      );
    await route.fulfill({ response, body: source });
  });
  const ready = () =>
    page.waitForFunction(
      () =>
        document
          .querySelector(".library-footer")
          ?.textContent?.includes("已加载"),
      {},
      { timeout: 120000 },
    );
  const pose = () =>
    page.evaluate(() => [
      ...window.__camera.position.toArray(),
      ...window.__camera.quaternion.toArray(),
      ...window.__controls.target.toArray(),
    ]);
  const delta = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
  const custom = () =>
    page.evaluate(() => {
      window.__camera.position.set(1.4, 1.2, 2.1);
      window.__controls.target.set(0.1, 0.9, 0);
      window.__controls.update();
      return [
        ...window.__camera.position.toArray(),
        ...window.__camera.quaternion.toArray(),
        ...window.__controls.target.toArray(),
      ];
    });
  const unchanged = async (before, message) => {
    await page.waitForTimeout(150);
    assert.ok(delta(before, await pose()) < 1e-6, message);
    console.log("Passed:", message);
  };
  await page.goto(`http://127.0.0.1:${port}/`);
  await ready();
  assert.equal(await page.title(), "人体学习工作台 · 开发版");
  const canvas = page.locator(".model-viewport canvas");
  const rectangle = await canvas.boundingBox();
  await canvas.click({position:{x:rectangle.width/2,y:rectangle.height*.43}});
  await page.locator(".selected-name").waitFor();
  await page.getByRole("button",{name:"隐藏所选结构",exact:true}).click();
  await page.getByRole("button",{name:"恢复图层",exact:true}).click();
  const dragBefore = await pose();
  await page.mouse.move(rectangle.x+rectangle.width*.5,rectangle.y+rectangle.height*.45);
  await page.mouse.down();
  await page.mouse.move(rectangle.x+rectangle.width*.62,rectangle.y+rectangle.height*.49,{steps:3});
  await page.mouse.up();
  assert.ok(delta(dragBefore,await pose())>.01,"Dragging actually orbits the rendered model");
  console.log("Passed: model ray picking and pointer orbit controls");
  const muscles = page.getByRole("switch", { name: "显示肌肉", exact: true });
  let before = await custom();
  await muscles.setChecked(false);
  await unchanged(before, "hiding muscles preserves camera pose");
  await muscles.setChecked(true);
  await page.getByRole("textbox", { name: "搜索人体结构" }).fill("心脏");
  await page.locator(".structure-result").first().click();
  await page.locator(".selected-name").waitFor();
  assert.match(await page.locator(".selected-name").textContent(), /heart/i);
  before = await pose();
  await page.getByRole("button", { name: "聚焦所选结构", exact: true }).click();
  assert.ok(
    delta(before, await pose()) > 0.01,
    "Focus explicitly moves the camera",
  );
  await page.getByRole("button", { name: "收藏", exact: true }).click();
  await page.getByRole("button", { name: /人体系统/ }).click();
  before = await pose();
  await muscles.setChecked(false);
  await unchanged(before, "layer toggling after focus preserves camera pose");
  await page.getByRole("button", { name: "单独观察", exact: true }).click();
  await unchanged(before, "isolation preserves camera pose");
  await page.getByRole("button", { name: "隐藏所选结构", exact: true }).click();
  await unchanged(before, "hiding a selected structure preserves camera pose");
  assert.equal(await page.locator(".selected-name").count(), 0);
  await page.setViewportSize({ width: 1280, height: 850 });
  await unchanged(before, "viewport resizing preserves camera pose");
  await page.getByRole("button", { name: "重置视角", exact: true }).click();
  assert.ok(
    delta(before, await pose()) > 0.01,
    "Explicit home still resets the camera",
  );
  await page.reload();
  await ready();
  await page.getByRole("button", { name: /收藏/ }).first().click();
  assert.equal(
    await page.locator(".bookmark-row").count(),
    1,
    "Bookmarks survive reload",
  );
  await page.getByRole("combobox", { name: "学习模型" }).selectOption("female");
  await ready();
  await page.getByRole("button", { name: /收藏/ }).first().click();
  assert.equal(
    await page.locator(".bookmark-row").count(),
    0,
    "Model bookmarks stay separate",
  );
  await page.getByRole("textbox", { name: "搜索人体结构" }).fill("uterus");
  assert.ok(
    (await page.locator(".structure-result").count()) > 0,
    "Female source search is available",
  );
  await page.getByRole("button", { name: "关于与来源", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  assert.match(await page.getByRole("dialog").textContent(), /React/);
  assert.match(await page.getByRole("dialog").textContent(), /思路参考/);
  await page.getByText("查看完整模型来源与改编记录").click();
  await page.waitForFunction(() =>
    document
      .querySelector(".about-dialog pre")
      ?.textContent?.includes("BodyParts3D"),
  );
  await page.keyboard.press("Escape");
  await page.getByRole("textbox", { name: "搜索人体结构" }).fill("");
  await page.getByRole("button", { name: /人体系统/ }).click();
  if (process.env.SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/workspace-desktop.png",
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "打开结构面板", exact: true }).click();
  assert.equal(await page.locator(".library-panel.open").count(), 1);
  await page.getByRole("textbox", { name: "搜索人体结构" }).fill("heart");
  await page.locator(".structure-result").first().click();
  assert.equal(await page.locator(".details-panel.open").count(), 1);
  await page.getByRole("button", { name: "关闭详情", exact: true }).click();
  if (process.env.SCREENSHOT_DIR)
    await page.screenshot({
      path: process.env.SCREENSHOT_DIR + "/workspace-mobile.png",
    });
  assert.deepEqual(errors, []);
  console.log(
    "Passed: selection, explicit focus/reset, both models, bookmarks, attribution and mobile panels.",
  );
} finally {
  await browser?.close();
  await server.close();
}
