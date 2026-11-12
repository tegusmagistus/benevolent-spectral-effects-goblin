const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
(async () => {
const browser = await chromium.launch({executablePath: ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(require('node:fs').existsSync),args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
require('node:fs').mkdirSync('depth-results',{recursive:true});
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:8765/public/');
await page.waitForSelector('.preview-toolbar');
const shell=page.locator('#stageShell'),canvas=page.locator('#stage'), zoom=page.getByLabel('Preview zoom');
const checkAspect=async()=> {
 await page.waitForTimeout(100);
 const box=await canvas.boundingBox();
 const ratio=await canvas.evaluate(c=>c.width/c.height);
 assert(Math.abs(box.width/box.height-ratio)<.02,JSON.stringify({box,ratio}));
 if (await zoom.inputValue()==='fit') {
   const viewport=await page.locator('.preview-viewport').boundingBox();
   const panel=await shell.boundingBox();
   assert(box.x>=viewport.x&&box.y>=viewport.y&&box.x+box.width<=viewport.x+viewport.width+1&&box.y+box.height<=viewport.y+viewport.height+1);
   assert(viewport.y>=panel.y&&viewport.y+viewport.height<=panel.y+panel.height+1);
 }
 return box;
};
const desktop=await checkAspect();
let docked=await shell.boundingBox();
assert(desktop.height>295,JSON.stringify(desktop));
const laptopLayouts=[];
for (const viewport of [{width:1366,height:650},{width:1440,height:700},{width:1280,height:720}]) {
 await page.setViewportSize(viewport);
 const video=await checkAspect();
 assert(video.height>=220,JSON.stringify({viewport,video}));
 const controls=await page.locator('.pro-quick-tune').boundingBox();
 const timeline=await page.locator('.timeline').boundingBox();
 assert(controls.y>=video.y+video.height && timeline.y+timeline.height<=viewport.height);
 await page.locator('[data-core-fx]').first().click();
 await page.getByLabel('Selected effect mix percent').fill('65');
 await page.getByLabel('Selected effect mix percent').press('Enter');
 assert.equal(await page.getByLabel('Selected effect mix').inputValue(),'0.65');
 laptopLayouts.push({viewport,video,controls,timeline});
 await page.screenshot({path:`depth-results/preview-laptop-${viewport.width}x${viewport.height}.png`});
}
await page.setViewportSize({width:1440,height:900});
await checkAspect();
docked=await shell.boundingBox();
for(const ratio of ['9:16','1:1','16:9']) {
 await page.locator('#aspectSelect').evaluate((el,ratio)=>{el.value=ratio;el.dispatchEvent(new Event('change',{bubbles:true}));},ratio);
 await checkAspect();
}
for(const scale of ['0.5','1','1.5','2']) {
 await zoom.selectOption(scale);
 const box=await checkAspect();
 assert(Math.abs(box.width-(await canvas.evaluate(c=>c.width))*Number(scale))<2);
}
await zoom.selectOption('fit');
await page.screenshot({path:'depth-results/preview-desktop.png'});
async function drag(locator,dx,dy) {
 const b=await locator.boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
 await page.mouse.down();
 await page.mouse.move(b.x+b.width/2+dx,b.y+b.height/2+dy,{steps:4});
 await page.mouse.up();
}
await drag(page.locator('[data-edge=se]'),-120,-65);
assert((await shell.boundingBox()).height<docked.height-50);
await page.getByRole('button',{name:'Reset',exact:true}).click();
await page.getByRole('button',{name:'Float',exact:true}).click();
const before=await shell.boundingBox();
await drag(page.locator('.preview-grip'),-2000,-2000);
assert((await shell.boundingBox()).x===8);
await drag(page.locator('[data-edge=se]'),70,50);
assert((await shell.boundingBox()).width>before.width+50);
await page.getByRole('button',{name:'Reset',exact:true}).click();
await page.locator('[data-core-fx]').first().click();
await page.screenshot({path:'depth-results/preview-floating.png'});
await page.getByRole('button',{name:'Fullscreen preview',exact:true}).click();
await page.waitForFunction(()=>document.fullscreenElement || document.querySelector('.preview-expanded'));
assert((await shell.boundingBox()).width>=1439);
await page.getByRole('button',{name:'Exit fullscreen preview',exact:true}).click();
await page.getByRole('button',{name:'Fullscreen preview',exact:true}).waitFor();
await page.setViewportSize({width:390,height:844});
await page.waitForFunction(()=>{
 const box=document.querySelector('.preview-floating').getBoundingClientRect();
 return box.x>=7&&box.right<=391&&box.y>=7&&box.bottom<=845;
});
const floated=await shell.boundingBox();
assert(floated.x>=7&&floated.x+floated.width<=391);
await page.getByRole('button',{name:'Dock',exact:true}).click();
const mobile=await checkAspect();
assert(mobile.height>180);
assert.deepEqual(errors,[]);
await page.screenshot({path:'depth-results/preview-mobile.png'});
console.log({desktop,laptopLayouts,mobile,floated,errors});
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
