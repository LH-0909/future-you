import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1672,height:941}});
 const errors=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()})});
 await page.goto('https://lh-0909.github.io/future-you/',{waitUntil:'networkidle',timeout:90000});
 console.log(JSON.stringify({title:await page.title(),headings:await page.locator('h1,h2').allTextContents(),images:await page.locator('img').evaluateAll(imgs=>({total:imgs.length,broken:imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})),errors,failed},null,2));
 if(errors.length||failed.length)process.exitCode=1;
} finally {await browser.close()}
