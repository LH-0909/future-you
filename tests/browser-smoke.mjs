// Run against a retained local dev server. PLAYWRIGHT_MODULE_PATH can point
// to a bundled Playwright package; otherwise install playwright locally.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH || import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],results=[];
const context=await browser.newContext({viewport:{width:1440,height:1050},acceptDownloads:true});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
const url=process.env.TEST_URL || 'http://127.0.0.1:5173/';
async function nav(name){await page.locator('.nav-item').filter({hasText:name}).click();}
async function noOverflow(label){const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(widths.scroll<=widths.viewport+1,`${label}: horizontal overflow ${JSON.stringify(widths)}`);}
try{
  await page.goto(url,{waitUntil:'networkidle'});
  await nav('数字人体');
  await page.locator('[data-model-ready="true"]').waitFor({timeout:30000});
  await page.getByRole('button',{name:'暂停自动旋转',exact:true}).click();
  await noOverflow('desktop overview');
  assert.equal(await page.locator('.body-viewer').getAttribute('data-parts'),'1050');
  await page.locator('#range-sleep').fill('7.5');
  await page.getByRole('button',{name:'查看大脑科普',exact:true}).click();
  await page.getByRole('heading',{name:'保持规律与质量',exact:true}).waitFor();
  await page.getByRole('button',{name:'恢复全身视角',exact:true}).click();
  await page.waitForTimeout(300);
  await page.screenshot({path:'test-results/final-desktop.png',fullPage:true});
  await page.locator('.body-viewer canvas').screenshot({path:'public/models/anatomy-preview.png'});
  for(const name of ['内脏','肌肉','骨骼','体表','解剖透视']){
    await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(150);
  }
  results.push('Real anatomy loads 1,050 structures; five layers; live sleep feedback; focus and reset');
  await nav('习惯实验室');
  for(const name of ['运动实验室','饮食实验室','久坐实验室','睡眠实验室']){
    await page.locator('.scene-tabs').getByRole('button',{name,exact:true}).click();await noOverflow(`desktop ${name}`);
  }
  await page.locator('#range-sleep').fill('8');
  await nav('数字人体');assert.equal(await page.locator('#range-sleep').inputValue(),'8');
  results.push('Four laboratories share editable profile with overview');
  await nav('我的改变实验');await page.getByRole('button',{name:'生成画像，开始我的实验'}).click();
  await page.locator('#range-sleep').fill('8.5');await page.getByRole('button',{name:'比较两个未来',exact:true}).click();
  await nav('时间机器');await page.getByRole('button',{name:'30 天',exact:true}).click();
  await page.getByRole('heading',{name:'30 天，多安排 15 小时睡眠机会。'}).waitFor();
  await noOverflow('time');
  await nav('平行人生');assert.equal(await page.locator('.experiment-branch').count(),2);
  await page.getByRole('button',{name:'现在',exact:true}).click();
  const facts=await page.locator('.branch-fact').allTextContents();assert.equal(facts[0],facts[1]);
  await page.getByRole('button',{name:'30 天',exact:true}).click();
  await page.screenshot({path:'test-results/final-parallel.png',fullPage:true});
  results.push('Time chapters and two branches; baseline facts match at Now');
  await nav('七日行动');await page.getByRole('button',{name:'开始我的七日行动',exact:true}).click();
  const goalTitle=await page.locator('.goal-text strong').first().textContent();
  await page.locator('.goal-card input').first().check();
  await nav('数字人体');await page.locator('#range-sleep').fill('4');
  await nav('七日行动');assert.equal(await page.locator('.goal-text strong').first().textContent(),goalTitle);assert.equal(await page.locator('.goal-card input').first().isChecked(),true);
  await page.reload({waitUntil:'networkidle'});await nav('七日行动');assert.equal(await page.locator('.goal-card input').first().isChecked(),true);
  await page.locator('.day-selector button').nth(6).click();assert.equal(await page.locator('.goal-card input').first().isDisabled(),true);
  await page.locator('.day-selector button').first().click();
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'保存行动卡',exact:true}).click();
  const download=await downloaded;await download.saveAs('test-results/action-card.png');assert.ok(fs.statSync('test-results/action-card.png').size>10000);
  results.push('Frozen goals, persisted check-in, future-date blocking, PNG export');
  await nav('知识挑战');
  for(const answer of [2,0,2,1]){await page.locator('.quiz-options button').nth(answer).click();await page.locator('.quiz-actions .primary-button').click();}
  await page.getByText('4 / 4',{exact:true}).waitFor();
  results.push('Quiz all questions, explanation, score and result');
  await nav('科学依据');await page.getByRole('button',{name:'清除本机体验数据',exact:true}).click();await page.getByRole('button',{name:'确认清除本机数据',exact:true}).click();
  await nav('七日行动');await page.getByRole('button',{name:'开始我的七日行动',exact:true}).waitFor();
  await nav('数字人体');assert.equal(await page.locator('#range-sleep').inputValue(),'6.5');
  await page.getByRole('button',{name:'轻量模式',exact:true}).click();await page.locator('.real-flat img').waitFor();
  await page.locator('.real-flat img').evaluate(img=>img.decode());
  assert.ok(await page.locator('.real-flat img').evaluate(img=>img.complete&&img.naturalWidth>0));
  results.push('Clear state restores defaults; lightweight view uses real-model screenshot');
  await page.setViewportSize({width:390,height:844});
  async function mobileNav(name){await page.getByRole('button',{name:'打开导航',exact:true}).click();await nav(name);await page.locator('.sidebar').waitFor({state:'hidden'});}
  for(const name of ['我的改变实验','数字人体','习惯实验室','时间机器','平行人生','七日行动','知识挑战','科学依据']){
    await mobileNav(name);await noOverflow(`390px ${name}`);
    await page.screenshot({path:`test-results/mobile-${name}.png`,fullPage:true});
  }
  await mobileNav('数字人体');await page.setViewportSize({width:320,height:568});await noOverflow('320px overview');
  await page.screenshot({path:'test-results/mobile-320.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1050});await page.getByRole('button',{name:'轻量模式',exact:true}).click();
  await page.locator('[data-model-ready="true"]').waitFor({timeout:30000});await page.screenshot({path:'test-results/final-real-anatomy.png',fullPage:true});
  results.push('All seven screens at 390px; 320px overview without horizontal overflow');
  assert.deepEqual(errors,[]);
  const report={date:'2026-10-09',passed:results,consoleErrors:errors};fs.writeFileSync('test-results/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
