/** Apply the 008 responsive console without replacing the existing effect engine. Idempotent. */
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
if(existsSync('source-assets')){const cssParts=readdirSync('source-assets').filter(n=>/^console-pro\.\d+\.csspart$/.test(n)).sort();if(cssParts.length)writeFileSync('public/console-pro.css',cssParts.map(n=>readFileSync('source-assets/'+n,'utf8')).join(''));}
const path='public/index.html';let html=readFileSync(path,'utf8');
const begin='/* BSEG_UI_008_START */',end='/* BSEG_UI_008_END */';
if(html.includes(begin)){const a=html.indexOf(begin),b=html.indexOf(end,a);if(b<0)throw Error('Incomplete UI extension');html=html.slice(0,a)+html.slice(b+end.length);}
html=html.replace(/<link\s+href="console-pro\.css[^\"]*"\s+rel="stylesheet"\s*\/?\s*>/g,'');
html=html.replace('</head>','<link href="console-pro.css?v=008" rel="stylesheet"/>\n</head>');
html=html.replace(/width=device-width,initial-scale=1\.0(?:,viewport-fit=cover)*/g,'width=device-width,initial-scale=1.0,viewport-fit=cover');
html=html.replaceAll('assets/spectral-guardian.svg','assets/guardian-reference.webp');
html=html.replace("category='Tibetan-inspired'","category='All'");
html=html.replace("name:'moon_transmission.bseg'","name:'spectral_session.bseg'").replace("name:'Moon + stardust'","name:'Guardian reference'");
const a=html.indexOf('function drawDemo('),b=html.indexOf('function drawMediaCover',a);
if(a<0||b<0)throw Error('Cannot locate preview function; no files overwritten.');
html=html.slice(0,a)+`function drawDemo(c,w,h,t,bands){
 if(!guardianTexture){guardianTexture=new Image();guardianTexture.src='assets/guardian-reference.webp';}
 c.save();c.fillStyle='#070b15';c.fillRect(0,0,w,h);
 if(guardianTexture.complete&&guardianTexture.naturalWidth){const k=Math.max(w/guardianTexture.naturalWidth,h/guardianTexture.naturalHeight);const iw=guardianTexture.naturalWidth*k,ih=guardianTexture.naturalHeight*k;c.drawImage(guardianTexture,(w-iw)/2,(h-ih)/2,iw,ih);}
 c.restore();
}
`+html.slice(b);
const advA=html.indexOf('function advancedControls('),advB=html.indexOf('function renderInspector()',advA);
if(advA<0||advB<0)throw Error('Advanced inspector anchor missing');
html=html.slice(0,advA)+`function advancedControls(fx){
 if(RITUAL_DEFS[fx.id])return '';
 const labels={
 echo:['Contrast','Echo offset X','Optical stretch','Persistence'],trails:['Contrast','Trail drift X','Trail drift Y / stretch','Decay'],timewarp:['Wave frequency / contrast','Displacement X','Displacement Y / stretch','Motion rate'],prismflare:['Diffraction / contrast','Channel split','Optical stretch','Spectral glow'],squeeze:['Squeeze X / contrast','Squeeze Y','Ripple detail / stretch','Ripple speed'],ghostdouble:['Contrast','Double offset X','Double offset Y / stretch','Echo blend'],caustic:['Wave detail / contrast','Refraction X','Refraction Y / stretch','Flow speed'],feedback:['Contrast','Feedback rotation','Feedback zoom / stretch','Persistence'],lens:['Lens warp / contrast','Sway X','Sway Y / stretch'],pulse:['Breathing depth / contrast','Sway X','Sway Y / stretch','Breathing speed'],shred:['Slice frequency / contrast','Displacement','Tint / stretch','Refresh rate'],afterglow:['Contrast','Drift X','Drift Y / stretch','Phosphor decay']};
 const names=labels[fx.id]||['Contrast','Exposure','Optical stretch'];
 return '<div class="fx-fine-tune"><div class="eyebrow">SIGNAL PARAMETERS</div>'+names.map((name,i)=>rangeControl(name,'tune'+['A','B','C','D'][i],fx['tune'+['A','B','C','D'][i]]??.5,0,1,.01,'',false,'effect')).join('')+'</div>';
}
`+html.slice(advB);
if(!html.includes('// BSEG008 depth sampler'))html=html.replace('gl.uniform1i(u.u_tex,0);gl.uniform1i(u.u_depthTex,1);','gl.uniform1i(u.u_tex,0);gl.uniform1i(u.u_depthTex,1);\n  // BSEG008 depth sampler\n  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.textures[3]);gl.activeTexture(gl.TEXTURE0);');
const ui=readFileSync('public/console-pro.js','utf8');const last=html.lastIndexOf('</script>');if(last<0)throw Error('Engine module missing');
html=html.slice(0,last)+'\n'+begin+'\n'+ui+'\n'+end+'\n'+html.slice(last);
for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new Function(m[1]);
if(existsSync('source-assets')){const parts=readdirSync('source-assets').filter(n=>/^guardian-reference\.\d+\.b64$/.test(n)).sort();if(parts.length)writeFileSync('public/assets/guardian-reference.webp',Buffer.from(parts.map(n=>readFileSync('source-assets/'+n,'utf8').trim()).join(''),'base64'));}
if(!existsSync('public/assets/guardian-reference.webp'))throw Error('Reference artwork is missing');
if(createHash('sha256').update(readFileSync('public/assets/guardian-reference.webp')).digest('hex')!=='b45be9c7d5f8e8c7a7f22f1a433623bd1f363f5cda22025e92bd07ebda2f52e6')throw Error('Reference artwork checksum mismatch');
writeFileSync(path,html);console.log('BSEG 008 applied: reference artwork, pinned preview, core FX, phone panels.');
await import('./repair-gpu.mjs');
