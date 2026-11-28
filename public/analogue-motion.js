/* Deterministic signal motion and original procedural overlays. No external assets. */
const ANALOGUE_MOTION_IDS=['analogueWaveH','analogueWaveV','analogueMeshOverlay','analogueScanEcho','analogueCyberGlyphs','analogueOriginalWindow'];
const analogueWaveControls=[['waveAmplitude','Wave depth',0,1,.01,.22],['waveFrequency','Wave frequency',1,24,.1,5],['waveDirection','Wave travel angle',0,360,1,0],['waveRate','Wave travel speed',-3,3,.05,.65]];
for(const [id,base,name,subtitle,extra,defaults] of [
 ['analogueWaveH','analogueContour','ANALOGUE / HORIZONTAL TIDE','Horizontal contour lines with travelling analogue waves',[],{orientation:1,hue:195,density:100,waveDirection:0}],
 ['analogueWaveV','analogueContour','ANALOGUE / VERTICAL TIDE','Vertical contour lines with travelling analogue waves',[],{orientation:0,hue:315,density:110,waveDirection:90}],
 ['analogueMeshOverlay','analogueWire','ANALOGUE / LIVING MESH','Animated luminous grid over original footage',[['backgroundMix','Original footage visibility',0,1,.01,.85]],{hue:145,density:42,relief:.5,waveAmplitude:.08}],
 ['analogueScanEcho','analogueContour','ANALOGUE / SILVER CURRENT','Monochrome wave contours with directional signal echoes',[['echoCopies','Echo copies',1,6,1,3],['echoSpacing','Echo distance',0,1,.01,.45],['echoDecay','Echo persistence',0,.95,.01,.55]],{saturation:0,hue:190,glow:.45,softness:.3,waveAmplitude:.3}]
]){
 const def=RITUAL_DEFS[base];RITUAL_DEFS[id]={...def,name,subtitle,controls:[...def.controls.filter(c=>!(id==='analogueMeshOverlay'&&c[0]==='orientation')),...analogueWaveControls,...extra].map(c=>{const a=[...c];if(c[0] in defaults)a[5]=defaults[c[0]];return a;}),hint:'Travelling waves follow timeline time. Angle 0 moves horizontally; 90 moves vertically. Negative travel speed reverses direction. Signal speed 0 freezes all procedural motion. Saturation 0 makes the signal black and white. Living Mesh is brightness-based relief, not face tracking or reconstructed 3D. Use Crisp detail for clearer features.'};
}
RITUAL_DEFS.analogueCyberGlyphs={name:'ANALOGUE / CYBER GLYPHS',category:'Analogue',icon:'⌘',subtitle:'Animated circuit sigils, reticles and data-pattern overlays',hint:'Original procedural symbols over your footage. Style: 0 sigils, 1 instruments, 2 mixed. Speed 0 freezes animation. Seed reproduces the same arrangement. Opacity controls only the overlay; the source is preserved.',controls:[['count','Symbol count',1,60,1,18],['size','Symbol size',.02,.2,.005,.065],['opacity','Overlay opacity',0,1,.01,.75],['width','Stroke width',.4,3,.1,1],['hue','Symbol colour',0,360,1,155],['saturation','Colour saturation / monochrome',0,1,.01,1],['glow','Symbol glow',0,1,.01,.25],['style','Symbol style',0,2,1,2],['speed','Animation speed',0,2,.01,.4],['drift','Travel distance',0,1,.01,.25],['rotation','Rotation amount',0,1,.01,.45],['seed','Noise seed',1,9999,1,73]]};
RITUAL_DEFS.analogueOriginalWindow={name:'ANALOGUE / ORIGINAL WINDOW',category:'Analogue',icon:'▣',subtitle:'Move a clear rectangle through the processed footage',hint:'Place last in the stack to keep this rectangle free of preceding effects. Selected layer restores that layer before its effects; Master restores the incoming layer composite before master effects. Later effects still process the window. Drag on preview or use X/Y and size; arrow keys move the selected window. The editing outline is not exported.',controls:[['windowX','Window centre X',0,1,.005,.5],['windowY','Window centre Y',0,1,.005,.5],['windowW','Window width',.05,1,.005,.32],['windowH','Window height',.05,1,.005,.3],['feather','Edge feather',0,.2,.005,0],['border','Frame width',0,4,.1,0],['hue','Frame colour',0,360,1,155],['saturation','Frame saturation',0,1,.01,1]]};
ANALOGUE_IDS.push(...ANALOGUE_MOTION_IDS);
function analogueWaveOffset(u,v,time,p){
 const a=(p.waveDirection||0)*Math.PI/180,clock=time*(p.speed??.35)*(p.waveRate??.65);
 const phase=((u*Math.cos(a)+v*Math.sin(a))*(p.waveFrequency??5)-clock)*Math.PI*2;
 const d=Math.sin(phase)*(p.waveAmplitude||0)*.075;
 return [d*Math.cos(a),d*Math.sin(a)];
}
function analogueWindowRect(p,w,h){
 const ww=Math.max(.05,Math.min(1,p.windowW??.32))*w,hh=Math.max(.05,Math.min(1,p.windowH??.3))*h;
 return {x:Math.max(0,Math.min(w-ww,(p.windowX??.5)*w-ww/2)),y:Math.max(0,Math.min(h-hh,(p.windowY??.5)*h-hh/2)),w:ww,h:hh};
}
function drawAnalogueWindow(owner,c,source,w,h,p){
 const original=owner.originalSource||source,r=analogueWindowRect(p,w,h),f=Math.min(r.w,r.h)*p.feather;
 c.save();c.beginPath();c.rect(r.x,r.y,r.w,r.h);c.clip();
 if(f>0){
  const patch=owner.windowPatch??=makeCanvas(w,h);if(patch.width!==w||patch.height!==h){patch.width=w;patch.height=h;}const pc=patch.getContext('2d');pc.clearRect(0,0,w,h);pc.drawImage(original,0,0,w,h);pc.globalCompositeOperation='destination-in';
  for(const horizontal of [true,false]){const start=horizontal?r.x:r.y,end=start+(horizontal?r.w:r.h),g=horizontal?pc.createLinearGradient(start,0,end,0):pc.createLinearGradient(0,start,0,end),q=f/(end-start);g.addColorStop(0,'transparent');g.addColorStop(q,'white');g.addColorStop(1-q,'white');g.addColorStop(1,'transparent');pc.fillStyle=g;pc.fillRect(0,0,w,h);}pc.globalCompositeOperation='source-over';c.drawImage(patch,0,0);
 }else c.drawImage(original,0,0,w,h);
 c.restore();if(p.border>0){c.save();c.strokeStyle=`hsl(${p.hue} ${p.saturation*100}% 80%)`;c.lineWidth=p.border*w/720;c.strokeRect(r.x,r.y,r.w,r.h);c.restore();}
}
function drawAnalogueGlyphs(c,w,h,time,p){
 const t=time*p.speed,unit=Math.min(w,h),count=Math.round(p.count);c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=c.fillStyle=`hsl(${p.hue} ${p.saturation*100}% 78%)`;c.lineWidth=p.width*unit/500;c.shadowColor=c.strokeStyle;c.shadowBlur=p.glow*unit*.016;
 for(let i=0;i<count;i++){
  const rand=n=>analogueHash(i,n,p.seed),x=(.06+.88*rand(0))*w+Math.sin(t+rand(4)*6)*p.drift*w*.08,y=(.06+.88*rand(1))*h+Math.cos(t*.7+rand(5)*6)*p.drift*h*.08,r=p.size*unit*(.55+rand(2)*.45),mode=p.style===2?i%2:p.style;
  c.save();c.translate(x,y);c.rotate((rand(3)-.5)*.3+Math.sin(t*.8+i)*p.rotation);c.globalAlpha=p.opacity*(.65+.35*Math.sin(t*2+i)**2);c.beginPath();
  if(mode===0){const sides=3+i%4;for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2,xx=Math.cos(a)*r,yy=Math.sin(a)*r;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.moveTo(-r*1.2,0);c.lineTo(r*1.2,0);c.moveTo(0,-r*1.2);c.lineTo(0,r*1.2);c.moveTo(-r*.4,-r*.4);c.lineTo(r*.4,r*.4);}
  else{c.arc(0,0,r,t*.4,t*.4+Math.PI*1.5);c.moveTo(-r*1.25,-r*.65);c.lineTo(-r*1.25,-r*1.1);c.lineTo(-r*.8,-r*1.1);c.moveTo(r*1.25,r*.65);c.lineTo(r*1.25,r*1.1);c.lineTo(r*.8,r*1.1);for(let k=0;k<5;k++){const yy=r*(.35+k*.22);c.moveTo(r*1.5,yy);c.lineTo(r*(1.7+rand(k+8)),yy);}}
  c.stroke();c.beginPath();c.arc(0,0,r*.12,0,Math.PI*2);c.stroke();c.restore();
 }c.restore();
}
function analogueParameterControl(fx,c){
 const [key,label,min,max,step,value]=c,options=key==='orientation'?['Vertical lines','Horizontal lines']:key==='style'?['Circuit sigils','Instruments / reticles','Mixed symbols']:null;
 if(options)return `<div class="controlrow"><label for="analogue-${key}">${label}</label></div><select id="analogue-${key}" aria-label="${label}" data-effect-prop="${key}">${options.map((name,i)=>`<option value="${i}" ${Number(fx[key]??value)===i?'selected':''}>${name}</option>`).join('')}</select>`;
 return rangeControl(label,key,fx[key]??value,min,max,step,'',false,'effect');
}
