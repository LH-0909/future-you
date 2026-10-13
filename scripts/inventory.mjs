import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await b.newPage({viewport:{width:1600,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ready=()=>page.locator('.tb-status').first().waitFor({state:'hidden',timeout:20000}).catch(()=>{});
const dump=async()=>{const clean=a=>[...new Set(a.map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean))];
  return {headings:clean(await page.locator('h1,h2,h3').allTextContents()).slice(0,12),
    buttons:clean(await page.getByRole('button').allTextContents()).slice(0,26),
    notes:clean(await page.locator('.journey-small,.le-note,.journey-footnote,.tb-caption').allTextContents()).map(s=>s.slice(0,70)).slice(0,4),
    canvas:await page.locator('canvas').count()};};
try{await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await ready();
const out={};
out['00 入口']=await dump();
for(const label of ['01','02','03','04','05','06']){await page.getByRole('button',{name:new RegExp('^'+label)}).first().click();await ready();await page.waitForTimeout(400);out[label]=await dump();}
console.log(JSON.stringify({...out,errors},null,1));}finally{await b.close()}
