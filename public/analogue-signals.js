/* Original analogue-inspired signal reconstruction. All processing stays on device.
   Luminance is a relief proxy, not inferred 3D or subject segmentation. */
const ANALOGUE_IDS = ['analogueContour','analoguePhosphor','analogueDissolve','analogueWire'];
const analogueCommon = [
 ['density','Line density',24,160,1,78],['relief','Contour displacement',0,1,.01,.5],
 ['gate','Shadow cutoff',0,.65,.01,.12],['width','Line width',.3,2,.05,.8],
 ['glow','Phosphor glow',0,1.5,.01,.65],['hue','Signal colour',0,360,1,210],
 ['jitter','Signal instability',0,1,.01,.18],['speed','Signal speed',0,2,.01,.35],
 ['seed','Noise seed',1,9999,1,73]
];
for(const [id,name,subtitle,extra,defaults] of [
 ['analogueContour','ANALOGUE / CONTOUR','Luminous displaced contour lines on black',[],{}],
 ['analoguePhosphor','ANALOGUE / RGB PHOSPHOR','Broken CRT lines with spectral colour separation',[['rgb','RGB separation',0,1,.01,.45]],{hue:235,jitter:.3}],
 ['analogueDissolve','ANALOGUE / SIGNAL DISSOLVE','Contours breaking into drifting phosphor particles',[['dissolve','Dissolution',0,1,.01,.55],['spread','Particle drift',0,1,.01,.3]],{hue:325,glow:.4}],
 ['analogueWire','ANALOGUE / WIREFIELD','Crossed signal mesh shaped by the light in your footage',[],{density:48,hue:155,relief:.7,jitter:.08}]
]) RITUAL_DEFS[id]={name,category:'Analogue',icon:'≋',subtitle,
 hint:'Analogue-inspired digital reconstruction from your footage’s brightness. Use a well-lit subject against a dark background for clean separation; this is not automatic background removal or a 3D scan. Speed 0 freezes signal noise. Strength mixes the original back in. The same processor is used for preview and export.',
 controls:[...analogueCommon.map(c=>{const a=[...c];if(c[0] in defaults)a[5]=defaults[c[0]];return a;}),...extra]};
function analogueHash(x,y,seed){let n=(Math.imul(x+1,374761393)^Math.imul(y+1,668265263)^Math.imul(seed|0,1274126177))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function analogueDimensions(w,h,max){const k=Math.min(1,max/Math.max(w,h));return [Math.max(2,Math.round(w*k)),Math.max(2,Math.round(h*k))];}
function drawAnalogueSignal(owner,c,source,w,h,time,p,id){
 const buffers=owner.analogueBuffers??={sample:makeCanvas(),ink:makeCanvas(),luma:null};
 const [sw,sh]=analogueDimensions(w,h,384),[rw,rh]=analogueDimensions(w,h,960);
 const sample=buffers.sample,ink=buffers.ink;
 if(sample.width!==sw||sample.height!==sh){sample.width=sw;sample.height=sh;buffers.luma=new Float32Array(sw*sh);}
 if(ink.width!==rw||ink.height!==rh){ink.width=rw;ink.height=rh;}
 const sc=sample.getContext('2d',{willReadFrequently:true});sc.clearRect(0,0,sw,sh);sc.drawImage(source,0,0,sw,sh);
 const rgba=sc.getImageData(0,0,sw,sh).data,L=buffers.luma??(buffers.luma=new Float32Array(sw*sh));
 for(let i=0,j=0;i<L.length;i++,j+=4)L[i]=(.2126*rgba[j]+.7152*rgba[j+1]+.0722*rgba[j+2])/255*(rgba[j+3]/255);
 const luminance=(u,v)=>{const x=Math.max(0,Math.min(sw-1,u*(sw-1))),y=Math.max(0,Math.min(sh-1,v*(sh-1)));const ix=Math.floor(x),iy=Math.floor(y),xx=Math.min(sw-1,ix+1),yy=Math.min(sh-1,iy+1),a=x-ix,b=y-iy;return (L[iy*sw+ix]*(1-a)+L[iy*sw+xx]*a)*(1-b)+(L[yy*sw+ix]*(1-a)+L[yy*sw+xx]*a)*b;};
 const clock=(Number.isFinite(time)?time:0)*p.speed,frame=Math.floor(clock*12),seed=p.seed|0;
 const paths=Array.from({length:8},()=>new Path2D()),dots=Array.from({length:8},()=>new Path2D());
 const passes=id==='analogueWire'?2:1,n=Math.round(p.density),steps=192;
 for(let axis=0;axis<passes;axis++)for(let line=0;line<=n;line++){
  let previous=null;
  for(let j=0;j<=steps;j++){
   const u=axis?j/steps:line/n,v=axis?line/n:j/steps;
   const light=luminance(u,v),value=Math.max(0,(light-p.gate)/(1-p.gate));
   if(value<.025){previous=null;continue;}
   const noise=analogueHash(line,j,seed+frame),staticNoise=analogueHash(line,j,seed);
   const tear=Math.sin(v*39+clock*2.4+seed*.13)*Math.sin(v*113-clock*.8+seed*.07);
   let x=u*rw+(light-.15)*p.relief*rw*.115+p.jitter*rw*.014*tear;
   let y=v*rh+(axis?(light-.15)*p.relief*rh*.075:0);
   const dissolved=id==='analogueDissolve'&&staticNoise<p.dissolve*(.18+.82*u);
   if(dissolved){x+=p.spread*rw*.34*Math.pow(staticNoise, .5)*( .6+.4*Math.sin(clock*.7+noise*6));y+=(noise-.5)*p.spread*rh*.14;}
   const band=Math.min(7,Math.floor(Math.pow(value,.65)*8));
   const broken=id==='analoguePhosphor'&&noise<p.jitter*.48;
   if(broken){previous=null;continue;}
   if(dissolved){const radius=Math.max(.45,p.width*.7)*(.5+noise);dots[band].moveTo(x+radius,y);dots[band].arc(x,y,radius,0,Math.PI*2);previous=null;}
   else {if(previous){paths[band].moveTo(previous[0],previous[1]);paths[band].lineTo(x,y);}previous=[x,y];}
  }
 }
 const ic=ink.getContext('2d');ic.clearRect(0,0,rw,rh);ic.lineJoin='round';ic.lineCap='round';
 function strokes(hue,offset,alpha){ic.save();ic.translate(offset,0);ic.globalAlpha=alpha;for(let i=0;i<8;i++){ic.strokeStyle=ic.fillStyle=`hsl(${hue} 95% ${36+i*7}%)`;ic.lineWidth=p.width*(.55+i*.12);ic.stroke(paths[i]);ic.fill(dots[i]);}ic.restore();}
 ic.globalCompositeOperation='screen';
 if(id==='analoguePhosphor'){strokes(p.hue-65,-p.rgb*5,.7);strokes(p.hue+90,p.rgb*5,.7);}
 strokes(p.hue,0,1);
 c.fillStyle='#010207';c.fillRect(0,0,w,h);c.save();c.globalCompositeOperation='screen';
 if(p.glow>0){c.globalAlpha=Math.min(1,p.glow*.7);c.filter=`blur(${Math.max(1,w/rw*7*p.glow)}px)`;c.drawImage(ink,0,0,w,h);c.globalAlpha=Math.min(1,p.glow);c.filter=`blur(${Math.max(.5,w/rw*2*p.glow)}px)`;c.drawImage(ink,0,0,w,h);}
 c.filter='none';c.globalAlpha=1;c.drawImage(ink,0,0,w,h);c.restore();
 if(id==='analoguePhosphor'){c.save();c.fillStyle='#000';c.globalAlpha=.28;const pitch=Math.max(2,h/rh*3);for(let y=0;y<h;y+=pitch)c.fillRect(0,y,w,pitch*.25);c.restore();}
}
