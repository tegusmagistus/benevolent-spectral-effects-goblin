const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const out='depth-results';fs.mkdirSync(out,{recursive:true});
const report={status:'RUNNING',checks:[],errors:[]};
// Deterministic geometry and bounded work, independent of browser timing.
const context={RITUAL_DEFS:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('public/vertigo-flow.js','utf8'),context);
const defaults=Object.fromEntries(context.RITUAL_DEFS.vertigoflow.controls.map(([k,,,,,v])=>[k,v]));
const a=context.vertigoFlowGeometry(1.25,defaults),b=context.vertigoFlowGeometry(1.25,defaults);
assert.equal(JSON.stringify(a),JSON.stringify(b));
assert.equal(JSON.stringify(context.vertigoFlowGeometry(0,{...defaults,speed:0})),JSON.stringify(context.vertigoFlowGeometry(10,{...defaults,speed:0})));
for(const height of [0,.72,1])for(const repeat of [1,6]){const g=context.vertigoFlowGeometry(123,{...defaults,height,repeat});assert(g.scale>0&&g.scale<1&&g.stops.length<=32&&g.stops.every(Number.isFinite));}
report.checks.push('Deterministic bounded projection; speed zero freezes motion');
(async()=>{let browser;
try {
 browser=await chromium.launch({executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(fs.existsSync),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://localhost:8765/public/');await page.waitForFunction(()=>window.__VFX02_TEST__?.getEngine().rituals.includes('vertigoflow'));
 await page.evaluate(async()=>{const t=__VFX02_TEST__,c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d');x.fillStyle='#0c182e';x.fillRect(0,0,320,180);for(let j=0;j<9;j++)for(let i=0;i<16;i++){x.fillStyle=`hsl(${i*19+j*5} 65% ${25+j*6}%)`;x.fillRect(i*20+2,j*20+2,16,16);}x.fillStyle='#fff';x.fillRect(30,40,8,70);const blob=await new Promise(r=>c.toBlob(r));await t.importFiles([new File([blob],'perspective-fixture.png',{type:'image/png'})]);const s=document.querySelector('#aspectSelect');s.value='source';s.dispatchEvent(new Event('change',{bubbles:true}));});
 report.render=await page.evaluate(()=>{
  const t=__VFX02_TEST__,s=t.getState(),gl=document.querySelector('#stage').getContext('webgl2');t.setScope('master');s.effects=[];s.layers.forEach(l=>l.effects=[]);
  const pixels=()=>{const p=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};
  const diff=(a,b)=>a.reduce((n,v,i)=>n+Math.abs(v-b[i]),0)/a.length;
  t.renderFrame(0);const original=pixels();t.addEffect('vertigoflow');const f=s.effects[0];f.amount=1;t.renderFrame(1.25);const active=pixels();t.renderFrame(1.25);const stable=diff(active,pixels());t.renderFrame(2.75);const motion=diff(active,pixels());
  const controls={};for(const [key,min,max]of [['height',0,1],['fall',0,1],['sway',0,1],['speed',0,2],['tilt',-30,30],['repeat',1,6]]){const old=f[key];f[key]=min;t.renderFrame(1.25);const lo=pixels();f[key]=max;t.renderFrame(1.25);controls[key]=diff(lo,pixels());f[key]=old;}
  f.speed=0;t.renderFrame(0);const frozen=pixels();t.renderFrame(5);const freeze=diff(frozen,pixels());f.speed=.35;
  f.amount=0;t.renderFrame(0);const zero=diff(original,pixels());f.amount=1;f.enabled=false;t.renderFrame(0);const bypass=diff(original,pixels());f.enabled=true;
  const saved=JSON.stringify(f);Object.assign(f,JSON.parse(saved));const roundTrip=JSON.stringify(f)===saved;
  t.addEffect('crystalglass');t.renderFrame(.75);const orderA=pixels();s.effects.reverse();t.renderFrame(.75);const order=diff(orderA,pixels());s.effects=[f];t.renderFrame(1.25);
  return {active:diff(active,original),stable,motion,controls,freeze,zero,bypass,roundTrip,order,error:gl.getError()};
 });
 const r=report.render;assert(r.active>1&&r.motion>.1&&r.stable===0&&r.freeze===0&&r.zero===0&&r.bypass===0&&r.roundTrip&&r.order>.1&&r.error===0,JSON.stringify(r));assert(Object.values(r.controls).every(v=>v>.05),JSON.stringify(r.controls));
 report.checks.push('Every parameter changes pixels; zero mix, bypass, freeze, save round-trip and stack order');
 await page.getByLabel('height precise value',{exact:true}).fill('0.55');await page.getByLabel('height precise value',{exact:true}).press('Tab');
 assert.equal(await page.evaluate(()=>__VFX02_TEST__.getState().effects[0].height),.55);
 await page.locator('[data-reset-ritual="vertigoflow"]').click();assert.equal(await page.evaluate(()=>__VFX02_TEST__.getState().effects[0].height),.72);
 await page.screenshot({path:path.join(out,'vertigo-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.getByRole('searchbox',{name:'Search all effects'}).fill('oh god jeff');
 const item=page.locator('[data-add-fx="vertigoflow"]');assert(await item.isVisible());
 assert(await item.locator('strong').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.screenshot({path:path.join(out,'vertigo-phone.png')});
 report.checks.push('Searchable Tibetan collection entry, real numeric controls/reset and wrapping phone title');
 await page.setViewportSize({width:1440,height:900});
 await page.setInputFiles('#mediaUpload',path.resolve('tests/motion.mp4'));
 await page.waitForFunction(()=>{const t=__VFX02_TEST__,l=t.getState().layers.find(l=>l.type==='video');return l&&t.getMedia(l.id).readyState>=2;});
 await page.evaluate(()=>{const t=__VFX02_TEST__,s=t.getState();s.layers=s.layers.filter(l=>l.type==='video');s.layers.forEach(l=>l.effects=[]);s.effects=[];t.setScope('master');t.addEffect('vertigoflow');t.addEffect('crystalglass');s.duration=1;t.seek(0);});
 await page.click('#playButton');await page.waitForFunction(()=>{const t=__VFX02_TEST__,l=t.getState().layers.find(l=>l.type==='video');return t.getMedia(l.id).currentTime>.15;});await page.click('#playButton');
 const wait=page.waitForEvent('download',{timeout:45000});await page.click('#recordVideo');const download=await wait;const dest=path.join(out,'vertigo-motion'+path.extname(download.suggestedFilename()));await download.saveAs(dest);assert(fs.statSync(dest).size>1000);
 report.export=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height','-of','json',dest],{encoding:'utf8'}));assert(report.export.streams.some(s=>s.codec_type==='video'&&s.width===320&&s.height===180));
 report.checks.push('Moving H.264 import/playback and stacked video export at source resolution');
 // Exercise the same effect through the existing non-WebGL renderer.
 const fallback=await browser.newPage({viewport:{width:390,height:844}});
 await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:get.call(this,type,...args);};});
 await fallback.goto('http://localhost:8765/public/');await fallback.waitForFunction(()=>window.__VFX02_TEST__?.getEngine().rituals.includes('vertigoflow'));
 report.fallback=await fallback.evaluate(()=>{const t=__VFX02_TEST__,s=t.getState(),c=document.querySelector('#stage'),ctx=c.getContext('2d');t.setScope('master');s.effects=[];t.renderFrame(0);const a=ctx.getImageData(0,0,c.width,c.height).data;t.addEffect('vertigoflow');t.renderFrame(1);const b=ctx.getImageData(0,0,c.width,c.height).data;return {gpu:t.getEngine().gpu,changed:a.some((v,i)=>v!==b[i])};});assert(!report.fallback.gpu&&report.fallback.changed);report.checks.push('Canvas fallback renders the new effect');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'vertigo-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();}
})();
