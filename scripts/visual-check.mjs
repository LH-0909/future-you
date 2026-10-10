import { createRequire } from 'node:module';
import fs from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH || import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR',e.message);});
page.on('console',message=>{if(['error','warning'].includes(message.type()))console.log(message.type(),message.text());});
page.on('requestfailed',r=>console.log('REQUEST_FAILED',r.url(),r.failure()));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
console.log('page loaded',await page.title());
await page.screenshot({path:'test-results/initial-state.png',fullPage:true});
await page.locator('[data-model-ready="true"]').waitFor({timeout:60000});
await page.getByRole('button',{name:'暂停自动旋转',exact:true}).click();
await page.screenshot({path:'test-results/desktop-real-anatomy.png',fullPage:true});
await page.locator('.body-viewer canvas').screenshot({path:'public/models/anatomy-preview.png'});
for(const name of ['内脏','肌肉','骨骼','体表','解剖透视']){
 await page.getByRole('button',{name,exact:true}).click();
 await page.waitForTimeout(250);
 await page.screenshot({path:`test-results/model-${name}.png`,fullPage:false});
}
console.log(JSON.stringify({ready:true,parts:await page.locator('.body-viewer').getAttribute('data-parts'),errors}));
await browser.close();
