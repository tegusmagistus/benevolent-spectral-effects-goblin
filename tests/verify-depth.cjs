const {chromium}=require('playwright-core');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve('public'),out='depth-results';fs.mkdirSync(out,{recursive:true});
const report={version:'012',status:'RUNNING',checks:[],effects:[],viewports:[],errors:[]};
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}try{res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}});
(async()=>{await new Promise(r=>server.listen(8128,'127.0.0.1',r));let browser;
try{
 const executablePath=['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto('http://127.0.0.1:8128/',{waitUntil:'load'});await page.waitForFunction(()=>window.__BSEG_DEPTH__?.version==='012');
 report.engine=await page.evaluate(()=>window.__VFX02_TEST__.getEngine());assert(report.engine.gpu,'WebGL2 failed to initialize');report.lab=await page.evaluate(()=>({families:window.__BSEG_DEPTH__.families,parameterCount:window.__BSEG_DEPTH__.parameterCount,lookCount:window.__BSEG_DEPTH__.lookCount}));
 await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=320;c.height=180;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,320,180);g.addColorStop(0,'#081525');g.addColorStop(.35,'#754eaf');g.addColorStop(.7,'#eaae4e');g.addColorStop(1,'#d0eeff');x.fillStyle=g;x.fillRect(0,0,320,180);x.fillStyle='white';x.beginPath();x.arc(95,80,22,0,7);x.fill();x.fillStyle='#152244';x.fillRect(190,55,54,70);x.fillStyle='#ff0044';x.fillRect(240,20,5,130);const blob=await new Promise(r=>c.toBlob(r));await window.__VFX02_TEST__.importFiles([new File([blob],'fixture.png',{type:'image/png'})]);const select=document.querySelector('#aspectSelect');select.value='source';select.dispatchEvent(new Event('change',{bubbles:true}));});
 report.checks.push('Image import and source-sized rendering');
 const render=await page.evaluate(()=>{
  const t=window.__VFX02_TEST__,lab=window.__BSEG_DEPTH__,s=t.getState(),gl=document.querySelector('#stage').getContext('webgl2');t.setScope('master');const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
  const pixels=()=>{const p=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;};const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i++)n+=Math.abs(a[i]-b[i]);return n/a.length;};
  const clear=()=>{s.effects=[];s.layers.forEach(l=>l.effects=[]);lab.resetMemory();};clear();t.renderFrame(0);const baseline=pixels(),results=[];
  for(const id of lab.families){clear();t.addEffect(id);const f=s.effects[0];f.amount=1;t.renderFrame(0);if(lab.specs[id].temporal){const l=s.layers.find(l=>l.type==='image');l.x=13;t.renderFrame(1/30);l.x=0;}
   const active=pixels(),error=gl.getError();f.amount=0;t.renderFrame(.1);const zero=pixels();results.push({id,glError:error,activeDifference:diff(active,baseline),zeroDifference:diff(zero,baseline),deep:f.d12===1});
  }
  return results;
 });report.effects=render;assert(render.every(r=>r.glError===0&&r.deep&&r.zeroDifference<.001),'Render error or zero-mix identity failure');assert(render.every(r=>r.activeDifference>.001),'An upgraded processor did not affect pixels');report.checks.push('Each upgraded/new processor changes pixels; zero mix is exact identity');
 const controls=await page.evaluate(()=>{const t=window.__VFX02_TEST__,lab=window.__BSEG_DEPTH__,s=t.getState();s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect('ripple');const f=lab.getSelected();const start=f.deep_frequency;f.deepLocks={deep_frequency:true};lab.vary();const lock=f.deep_frequency===start;f.deepLocks={};f.deep_amplitude=0;t.seek(0);lab.setKey('deep_amplitude');f.deep_amplitude=20;t.seek(2);lab.setKey('deep_amplitude');const midpoint=lab.evaluate(f,1,{}).deep_amplitude;f.deepKeys={};f.deep_amplitude=10;f.deepTarget='deep_amplitude';f.deepDriver='sine';f.deepRate=1;f.deepMotion=.5;const animated=lab.evaluate(f,.25,{}).deep_amplitude;f.deepDriver='bass';const audio=lab.evaluate(f,.25,{bass:1}).deep_amplitude;const saved=lab.serialize();lab.restoreJSON(saved);return{lock,midpoint,animated,audio,roundTrip:lab.getSelected().deepTarget==='deep_amplitude'};});report.controls=controls;assert(controls.lock&&controls.midpoint===10&&controls.animated>10&&controls.audio>10&&controls.roundTrip);report.checks.push('Parameter locks, linear keyframes, motion/audio modulation and project settings round-trip');
 await page.evaluate(()=>{const t=window.__VFX02_TEST__,s=t.getState();s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect('crystalglass');});
 await page.click('[data-depth-next]');const lookBefore=await page.evaluate(()=>window.__BSEG_DEPTH__.getSelected().deepLook);await page.click('[data-depth-vary]');await page.evaluate(()=>window.__BSEG_DEPTH__.undo());assert.equal(await page.evaluate(()=>window.__BSEG_DEPTH__.getSelected().deepLook),lookBefore);report.checks.push('Look browsing, variation and undo');
 for(const id of ['chromatic','bloom','echo']){
  const read=()=>page.evaluate(()=>window.__BSEG_DEPTH__.getSelected());
  await page.evaluate(id=>window.__VFX02_TEST__.addEffect(id),id);
  const reuse=page.getByText('Reuse settings',{exact:true});
  if(!await reuse.evaluate(el=>el.parentElement.open))await reuse.click();
  const seed=page.locator('[data-depth-seed]');
  await seed.fill('ghostgirl');
  await page.click('[data-depth-reuse=seed]');
  const first=await read();
  await page.click('[data-depth-reuse=copy]');
  await page.click('[data-depth-vary]');
  await page.click('[data-depth-reuse=paste]');
  assert.deepEqual(await read(),first);
  await page.click('[data-depth-reset]');
  await seed.fill('ghostgirl');
  await page.click('[data-depth-reuse=seed]');
  const repeated=await read();
  for(const key of Object.keys(first).filter(k=>k.startsWith('deep_')))assert.equal(repeated[key],first[key]);
  page.once('dialog',dialog=>dialog.accept(id+' test preset'));
  await page.click('[data-depth-reuse=effect]');
  const preset=await page.evaluate(()=>window.__VFX02_TEST__.getState().customRecipes.at(-1));
  assert.deepEqual(preset.effects,[repeated]);
 }
 page.once('dialog',dialog=>dialog.accept('Test stack'));
 await page.click('[data-depth-reuse=stack]');
 assert(await page.evaluate(()=>{const s=window.__VFX02_TEST__.getState();return s.customRecipes.at(-1).effects.length===s.effects.length;}));
 report.checks.push('Seed repeatability, copy/paste, effect presets and stack presets');
 const legacy=await page.evaluate(()=>{const t=window.__VFX02_TEST__,s=t.getState(),gl=document.querySelector('#stage').getContext('webgl2');return Array.from(document.querySelectorAll('[data-add-fx]'),b=>b.dataset.addFx).map(id=>{s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect(id);s.effects[0].d12=undefined;t.renderFrame(.1);return{id,error:gl.getError()};});});assert(legacy.every(r=>r.error===0));report.checks.push('Legacy processor regression: no GPU errors');
 const temporal=await page.evaluate(()=>{const t=window.__VFX02_TEST__,lab=window.__BSEG_DEPTH__,s=t.getState(),gl=document.querySelector('#stage').getContext('webgl2');s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect('echo');t.addEffect('trails');for(let i=0;i<12;i++){s.layers.find(l=>l.type==='image').x=i;t.renderFrame(i/30);}s.layers.find(l=>l.type==='image').x=0;const stats=lab.stats();t.seek(0);t.renderFrame(0);const a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);t.renderFrame(0);const b=new Uint8Array(a.length);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);return{stats,pausedStable:a.every((x,i)=>x===b[i]),error:gl.getError()};});report.temporal=temporal;assert(temporal.pausedStable&&temporal.error===0&&temporal.stats[0].entries>=2&&temporal.stats.every(s=>s.entries<=8&&s.bytes<30e6));report.checks.push('Isolated temporal history, pause stability, seek reset and bounded buffers');
 await page.evaluate(()=>{const t=window.__VFX02_TEST__,s=t.getState();s.effects=[];s.layers.forEach(l=>l.effects=[]);['crystalglass','smoke','anamorphic'].forEach(t.addEffect);t.renderFrame(.3);});
 assert.equal(await page.evaluate(()=>document.querySelector('#stage').getContext('webgl2').getError()),0);report.checks.push('Mixed ritual and deep GPU stack');
 await page.evaluate(()=>{const t=window.__VFX02_TEST__,s=t.getState();s.effects=[];s.layers.forEach(l=>l.effects=[]);t.addEffect('crystalglass');t.setEffectParam('amount',.72);});
 for(const [width,height,name]of [[390,844,'phone'],[412,915,'android'],[844,390,'landscape'],[1440,1000,'desktop']]){await page.setViewportSize({width,height});await page.evaluate(()=>window.__BSEG_UI__.setPanel('tune'));await page.waitForTimeout(600);const p=await page.locator('#stage').boundingBox(),mix=await page.locator('.pro-quick-tune').boundingBox();assert(p.y>=0&&mix.y+mix.height<height);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.screenshot({path:path.join(out,name+'.png')});report.viewports.push({name,previewVisible:true,coreVisible:true});}report.checks.push('Phone, landscape and desktop preview and main controls stay visible');
 const imgWait=page.waitForEvent('download');await page.evaluate(()=>window.__VFX02_TEST__.exportImage());const image=await imgWait;await image.saveAs(path.join(out,'processed.png'));assert(fs.statSync(path.join(out,'processed.png')).size>1000);report.checks.push('Processed PNG export');
 if(fs.existsSync('tests/motion.mp4')){await page.setInputFiles('#mediaUpload',path.resolve('tests/motion.mp4'));await page.waitForFunction(()=>{const t=window.__VFX02_TEST__,l=t.getState().layers.find(l=>l.type==='video');return l&&t.getMedia(l.id).readyState>=2;});await page.evaluate(()=>{const t=window.__VFX02_TEST__;t.setScope('layer');t.addEffect('crystalglass');t.getState().duration=1;});const wait=page.waitForEvent('download',{timeout:30000});await page.click('#recordVideo');const v=await wait;const dest=path.join(out,'motion-output'+path.extname(v.suggestedFilename()));await v.saveAs(dest);report.videoBytes=fs.statSync(dest).size;assert(report.videoBytes>1000);report.checks.push('H.264 video import, deep processing and moving-video export');}
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(browser)await browser.close();server.close();}})();
