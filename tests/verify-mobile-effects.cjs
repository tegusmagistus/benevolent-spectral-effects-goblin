const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:['/usr/bin/google-chrome','/usr/bin/chromium'].find(fs.existsSync),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={viewports:[],errors:[]};
 try {
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto('http://localhost:8765/public/');
  await page.waitForSelector('.mobile-effect-filters');
  fs.mkdirSync('depth-results',{recursive:true});
  const search=page.getByRole('searchbox',{name:'Search all effects'});
  const filter=page.locator('.mobile-effect-filters');
  for(const viewport of [{width:360,height:740},{width:390,height:844},{width:412,height:760},{width:360,height:640}]) {
   await page.setViewportSize(viewport);
   await page.waitForTimeout(700);
   await page.screenshot({path:`depth-results/effects-phone-${viewport.width}x${viewport.height}.png`});
   const layout=await page.evaluate(()=>{
    const list=document.querySelector('#effectsList'),r=list.getBoundingClientRect();
    const visible=[...list.querySelectorAll('.effect-item')].filter(e=>{const b=e.getBoundingClientRect();return b.top>=r.top-1&&b.bottom<=r.bottom+1;});
    return {height:list.clientHeight,visible:visible.length,preview:document.querySelector('#stage').getBoundingClientRect().height,
     names:visible.map(e=>{const t=e.querySelector('strong');return {text:t.textContent,font:parseFloat(getComputedStyle(t).fontSize),fits:t.scrollWidth<=t.clientWidth+1,height:e.getBoundingClientRect().height};}),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   report.viewports.push({viewport,...layout});
   assert(layout.visible>=(viewport.height>650?4:2),JSON.stringify(report));
   assert(layout.names.every(n=>n.font>=11&&n.fits&&n.height>=44),JSON.stringify(layout));
   assert(layout.preview>=(viewport.height>650?100:55),JSON.stringify(layout));
   assert(!layout.overflow);
  }
  await page.setViewportSize({width:390,height:844});
  await filter.click();
  assert.equal(await filter.getAttribute('aria-expanded'),'true');
  await page.locator('#categoryBar').getByRole('button',{name:'Optics',exact:true}).click();
  assert.equal(await filter.getAttribute('aria-expanded'),'false');
  assert((await filter.textContent()).includes('Optics'));
  await filter.click();
  await page.locator('#categoryBar').getByRole('button',{name:'All',exact:true}).click();
  await search.fill('anamorphic');
  const result=page.locator('[data-add-fx="anamorphic"]');
  assert(await result.isVisible());
  await result.click();
  await page.waitForFunction(()=>document.querySelector('#proActiveName').textContent.includes('ANAMORPHIC'));
  await page.screenshot({path:'depth-results/effects-phone-search.png'});
  await search.fill('');
  const last=page.locator('#effectsList .effect-item').last();
  await last.scrollIntoViewIfNeeded();
  const lastBox=await last.boundingBox(),listBox=await page.locator('#effectsList').boundingBox();
  assert(lastBox.y>=listBox.y&&lastBox.y+lastBox.height<=listBox.y+listBox.height+1);
  await last.click();
  assert((await page.locator('#proActiveName').textContent()).includes('SPECTRAL DUOTONE'));
  await page.screenshot({path:'depth-results/effects-phone-scrolled.png'});
  await page.setViewportSize({width:1440,height:900});
  assert(await page.locator('#categoryBar').isVisible());
  assert(!await filter.isVisible());
  assert.deepEqual(report.errors,[]);
  report.status='PASS';
 } finally {
  fs.writeFileSync('depth-results/mobile-effects.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
