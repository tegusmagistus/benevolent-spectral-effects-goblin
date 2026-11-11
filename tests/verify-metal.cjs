const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const out='metal-results',root=path.resolve('public');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(8126,'127.0.0.1',r));const report={version:'011',checks:[],viewports:[],errors:[]};let browser;
try{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:8126/');await page.waitForFunction(()=>window.__BSEG_REFINEMENTS__==='009'&&window.__BSEG_UI__?.version==='008');
 report.engine=await page.evaluate(()=>window.__VFX02_TEST__.getEngine());assert(report.engine.gpu,'WebGL2 unavailable');
 for(const [width,height,name]of [[390,844,'phone'],[412,915,'android'],[320,568,'small-phone'],[844,390,'landscape'],[1440,1000,'desktop']]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.__BSEG_UI__.setPanel('effects'));await page.waitForTimeout(700);
  const before=await page.locator('#stage').boundingBox();await page.locator('#effectsList').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(180);
  const after=await page.locator('#stage').boundingBox(),mix=await page.locator('.pro-quick-tune').boundingBox(),list=await page.locator('#effectsList').boundingBox(),last=await page.locator('[data-add-fx]').last().boundingBox();
  assert(Math.abs(before.y-after.y)<1,'Preview moved while browsing');assert(mix.y+mix.height<height,'Mix control offscreen');assert(last.y+last.height<=list.y+list.height+1,'Last effect unreachable');
  const styles=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,stroke:getComputedStyle(document.querySelector('.logo-main')).webkitTextStrokeWidth,weight:getComputedStyle(document.querySelector('.logo-main')).fontWeight,overlay:getComputedStyle(document.querySelector('#app'),'::before').borderImageSource,clickThrough:getComputedStyle(document.querySelector('#app'),'::before').pointerEvents}));
  assert(!styles.overflow,'Horizontal overflow');assert.equal(styles.stroke,'0px');assert.equal(styles.weight,'400');assert(styles.overlay.includes('sigil-metal-frame.svg'));assert.equal(styles.clickThrough,'none');
  await page.locator('#effectsList').evaluate(e=>e.scrollTop=0);await page.screenshot({path:path.join(out,name+'.png')});
  report.viewports.push({name,width,height,previewPinned:true,effectsScrollable:true,controlsVisible:true,typography:styles.weight,metalFrame:true});
 }
 await page.click('[data-core-fx="bloom"]');await page.locator('#proStrength').evaluate(e=>{e.value=.42;e.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('#proStrengthNumber').inputValue(),'42');await page.click('#proBypass');assert.equal(await page.locator('#proBypass').getAttribute('aria-pressed'),'true');
 report.checks.push('Core effect, mix slider and bypass remain clickable beneath decorative frames');
 const render=await page.evaluate(()=>{const t=window.__VFX02_TEST__,s=t.getState(),gl=document.querySelector('#stage').getContext('webgl2'),ids=Array.from(document.querySelectorAll('[data-add-fx]'),e=>e.dataset.addFx);t.setScope('master');return ids.map(id=>{s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect(id);t.renderFrame(.1);t.renderFrame(.2);return {id,error:gl.getError()};});});
 report.effects=render;assert(render.every(r=>r.error===0),'GPU rendering error');report.checks.push('Existing effect library renders without GPU errors');assert.deepEqual(report.errors,[]);report.status='PASS';
 for(let n=0;n<9;n++){
  try{const url='https://benevolantgoblin.com/',r=await fetch(url+'?finish=011&verify='+Date.now(),{signal:AbortSignal.timeout(15000)}),html=await r.text();report.live={url,status:r.status,version011:html.includes('console-metal.css?v=011')};
   if(report.live.version011){const live=await browser.newPage({viewport:{width:390,height:844}}),errors=[];live.on('pageerror',e=>errors.push(e.message));await live.goto(url+'?finish=011',{waitUntil:'load'});await live.waitForFunction(()=>window.__BSEG_UI__?.version==='008');await live.waitForTimeout(800);report.live.engine=await live.evaluate(()=>window.__VFX02_TEST__.getEngine());report.live.styles=await live.evaluate(()=>({weight:getComputedStyle(document.querySelector('.logo-main')).fontWeight,stroke:getComputedStyle(document.querySelector('.logo-main')).webkitTextStrokeWidth,frame:getComputedStyle(document.querySelector('#app'),'::before').borderImageSource}));report.live.errors=errors;await live.screenshot({path:path.join(out,'live-phone.png')});await live.setViewportSize({width:1440,height:1000});await live.waitForTimeout(500);await live.screenshot({path:path.join(out,'live-desktop.png')});report.live.browserVerified=errors.length===0&&report.live.styles.frame.includes('sigil-metal-frame.svg');await live.close();break;}
  }catch(e){report.live={error:e.message};}if(n<8)await new Promise(r=>setTimeout(r,5000));
 }
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();server.close();}})();
