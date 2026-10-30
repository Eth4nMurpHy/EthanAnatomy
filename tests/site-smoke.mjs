import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
import {preview} from 'vite';
let browser,server;
try{
 let url=process.env.SITE_URL;
 if(!url){server=await preview({base:'/EthanAnatomy/',preview:{host:'127.0.0.1',port:0,strictPort:true}});url=`http://127.0.0.1:${server.httpServer.address().port}/EthanAnatomy/`;}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ready=async(count)=>{await page.waitForFunction(expected=>{const text=document.querySelector('.library-footer')?.textContent??'';return text.includes('已加载')&&text.replace(/[^0-9]/g,'')===String(expected);},count,{timeout:180000});assert.equal(await page.locator('.load-panel.error').count(),0);assert.ok(await page.locator('.model-viewport canvas').isVisible());};
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await ready(2234);
 assert.equal(await page.title(),'人体学习工作台 · 开发版');
 await page.getByRole('switch',{name:'显示肌肉',exact:true}).setChecked(false);
 await page.getByRole('textbox',{name:'搜索人体结构'}).fill('心脏');await page.locator('.structure-result').first().click();await page.locator('.selected-name').waitFor();assert.match(await page.locator('.selected-name').textContent(),/heart/i);await page.getByRole('button',{name:'聚焦所选结构',exact:true}).click();
 await page.getByRole('button',{name:'收藏',exact:true}).click();await page.reload();await ready(2234);await page.getByRole('button',{name:/收藏/}).first().click();assert.equal(await page.locator('.bookmark-row').count(),1);
 await page.getByRole('combobox',{name:'学习模型'}).selectOption('female');await ready(2245);
 await page.getByRole('button',{name:'关于与来源',exact:true}).click();await page.getByRole('dialog').waitFor();await page.getByText('查看完整模型来源与改编记录').click();await page.waitForFunction(()=>document.querySelector('.about-dialog pre')?.textContent?.includes('BodyParts3D'));await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);
 if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:process.env.SCREENSHOT_DIR+'/deployed-workspace.png'});}
 console.log(`Verified production site: ${url} — both models, rendered canvas, visibility, search/focus, saved bookmark and local attribution.`);
}finally{await browser?.close();if(server)await new Promise(resolve=>server.httpServer.close(resolve));}
