const {chromium}=require('playwright-core'),fs=require('fs');
const out='depth-live';fs.mkdirSync(out,{recursive:true});
(async()=>{const result={version:'012',checkedAt:new Date().toISOString(),status:'UNCONFIRMED',errors:[]};let browser;
try{
 const url='https://benevolantgoblin.com/';
 for(let i=0;i<9;i++){const r=await fetch(url+'?depth-check='+Date.now(),{signal:AbortSignal.timeout(15000)}),html=await r.text();result.httpStatus=r.status;result.deployed=html.includes('D12_CONTROLS_START')&&html.includes('deep-ergonomics')===false&&html.includes('window.__BSEG_DEPTH__.focus=focus');if(result.deployed)break;await new Promise(r=>setTimeout(r,5000));}
 if(!result.deployed)throw Error('Depth Lab not yet confirmed on custom domain');
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>result.errors.push(e.message));await page.goto(url+'?depth=012',{waitUntil:'load'});await page.waitForFunction(()=>window.__BSEG_DEPTH__?.version==='012');
 await page.evaluate(()=>{__VFX02_TEST__.setScope('master');__VFX02_TEST__.selectRecipe('d12-pearl');__BSEG_DEPTH__.focus();});await page.waitForTimeout(3500);await page.evaluate(()=>__BSEG_DEPTH__.focus());await page.screenshot({path:out+'/live-phone.png'});
 result.engine=await page.evaluate(()=>__VFX02_TEST__.getEngine());result.lab=await page.evaluate(()=>({parameters:__BSEG_DEPTH__.parameterCount,looks:__BSEG_DEPTH__.lookCount}));
 await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(700);await page.evaluate(()=>__BSEG_DEPTH__.focus());await page.screenshot({path:out+'/live-desktop.png'});
 await page.locator('#stage').screenshot({path:out+'/glass-halo-example.png'});
 // Check comparison changes only rendering and never discards stack settings.
 result.compare=await page.evaluate(()=>{const before=__BSEG_DEPTH__.serialize();__BSEG_DEPTH__.compare(true);__VFX02_TEST__.renderFrame(0);__BSEG_DEPTH__.compare(false);return before===__BSEG_DEPTH__.serialize();});
 result.status=result.errors.length===0&&result.engine.gpu&&result.compare?'PASS':'FAIL';
}catch(e){result.error=e.message;process.exitCode=1;}finally{if(browser)await browser.close();fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}})();
