/* Original analogue-inspired signal reconstruction. All processing stays on device.
   Luminance is a relief proxy, not inferred 3D or subject segmentation. */
const ANALOGUE_IDS = ['analogueContour','analoguePhosphor','analogueDissolve','analogueWire','analogueRoseDust','analogueNeonVeil','analogueCoralWave'];
const analogueCommon = [
 ['detail','Detail quality',1,3,1,1],['clarity','Shape clarity',0,1,.01,0],
 ['edgeDetail','Fine edge definition',0,1,.01,0],['softness','Glow softness',0,1,.01,1],
 ['continuity','Continuous lines',0,1,.01,0],
 ['density','Line density',24,320,1,90],['relief','Contour displacement',0,1,.01,.25],
 ['gate','Shadow cutoff',0,.65,.01,.12],['width','Line width',.3,2,.05,1.15],
 ['glow','Phosphor glow',0,1.5,.01,1.1],['hue','Signal colour',0,360,1,210],
 ['jitter','Signal instability',0,1,.01,.12],['speed','Signal speed',0,2,.01,.35],
 ['seed','Noise seed',1,9999,1,73]
];
for(const [id,name,subtitle,extra,defaults] of [
 ['analogueContour','ANALOGUE / CONTOUR','Luminous displaced contour lines on black',[],{}],
 ['analoguePhosphor','ANALOGUE / RGB PHOSPHOR','Broken CRT lines with spectral colour separation',[['rgb','RGB separation',0,1,.01,.45]],{hue:235,jitter:.3}],
 ['analogueDissolve','ANALOGUE / SIGNAL DISSOLVE','Contours breaking into drifting phosphor particles',[['dissolve','Dissolution',0,1,.01,.55],['spread','Particle drift',0,1,.01,.3]],{hue:325,glow:.4}],
 ['analogueWire','ANALOGUE / WIREFIELD','Crossed signal mesh shaped by the light in your footage',[],{density:48,hue:155,relief:.7,jitter:.08}],
 ['analogueRoseDust','ANALOGUE / ROSE DUST','Soft pink contours dissolving into fine rose phosphor grains',[
  ['dissolve','Dissolution',0,1,.01,.72],['spread','Particle drift',0,1,.01,.08],['grain','Grain size',.3,2,.05,1.4]
 ],{density:125,hue:333,glow:.65,relief:.3,width:.85,jitter:.18}],
 ['analogueNeonVeil','ANALOGUE / NEON VEIL','Violet signal contours inside a hot pink halo, with particle breakup',[
  ['haloHue','Halo colour',0,360,1,325],['split','Colour separation',0,1,.01,.35],['dissolve','Dissolution',0,1,.01,.28]
 ],{density:85,hue:258,glow:1.25,relief:.38,width:1.05,jitter:.4}],
 ['analogueCoralWave','ANALOGUE / CORAL INTERFERENCE','Coral pink and violet wave interference with torn analogue bands',[
  ['secondaryHue','Shadow colour',0,360,1,248],['interference','Interference depth',0,1,.01,.55],['frequency','Wave frequency',0,1,.01,.45]
 ],{density:105,hue:345,glow:.25,relief:.3,width:1,jitter:.32}]
]) RITUAL_DEFS[id]={name,category:'Analogue',icon:'≋',subtitle,
 hint:'Crisp detail preserves the subject with finer sampling, narrower lines and restrained glow. Quality: 1 Draft, 2 Fine, 3 Ultra (slower). Shape clarity reduces displacement and particle drift; Continuous lines reconnects broken/dotted traces. Edge definition sharpens brightness changes, but can also emphasise noise. These controls cannot recover detail absent from the source. Use a well-lit subject against a dark background. This is not background removal or a 3D scan. Speed 0 freezes signal noise. Preview and export use the same settings.',
 controls:[...analogueCommon.filter(c=>c[0]!=='continuity'||!['analogueContour','analogueWire'].includes(id)).map(c=>{const a=[...c];if(c[0] in defaults)a[5]=defaults[c[0]];return a;}),...extra]};
function analogueHash(x,y,seed){let n=(Math.imul(x+1,374761393)^Math.imul(y+1,668265263)^Math.imul(seed|0,1274126177))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function analogueDimensions(w,h,max){const k=Math.min(1,max/Math.max(w,h));return [Math.max(2,Math.round(w*k)),Math.max(2,Math.round(h*k))];}
function analogueSamplingPlan(w,h,quality=1){
 const q=Math.max(1,Math.min(3,Math.round(Number(quality)||1)));
 return {sample:analogueDimensions(w,h,[384,768,1536][q-1]),ink:analogueDimensions(w,h,[960,1440,1920][q-1]),steps:[192,384,768][q-1]};
}
function analogueCrispSettings(fx={}){return {detail:2,clarity:.8,edgeDetail:.45,softness:.2,continuity:1,density:Math.max(150,Math.min(320,Number(fx.density)||90)),width:.65,glow:Math.min(Number(fx.glow)||0,.45)};}
function drawAnalogueSignal(owner,c,source,w,h,time,p,id){
 const rose=id==='analogueRoseDust',neon=id==='analogueNeonVeil',coral=id==='analogueCoralWave';
 const buffers=owner.analogueBuffers??={sample:makeCanvas(),ink:makeCanvas(),luma:null};
 const plan=analogueSamplingPlan(w,h,p.detail),[sw,sh]=plan.sample,[rw,rh]=plan.ink;
 const clarity=Math.max(0,Math.min(1,p.clarity||0)),shape=1-clarity*.9,continuity=Math.max(0,Math.min(1,p.continuity||0));
 const sample=buffers.sample,ink=buffers.ink;
 if(sample.width!==sw||sample.height!==sh){sample.width=sw;sample.height=sh;buffers.luma=new Float32Array(sw*sh);}
 if(ink.width!==rw||ink.height!==rh){ink.width=rw;ink.height=rh;}
 const sc=sample.getContext('2d',{willReadFrequently:true});sc.clearRect(0,0,sw,sh);sc.drawImage(source,0,0,sw,sh);
 const rgba=sc.getImageData(0,0,sw,sh).data,L=buffers.luma??(buffers.luma=new Float32Array(sw*sh));
 for(let i=0,j=0;i<L.length;i++,j+=4)L[i]=(.2126*rgba[j]+.7152*rgba[j+1]+.0722*rgba[j+2])/255*(rgba[j+3]/255);
 let tones=L;
 if(p.edgeDetail>0){
  if(!buffers.detailLuma||buffers.detailLuma.length!==L.length)buffers.detailLuma=new Float32Array(L.length);
  tones=buffers.detailLuma;
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
   const i=y*sw+x,mean=(L[y*sw+Math.max(0,x-2)]+L[y*sw+Math.min(sw-1,x+2)]+L[Math.max(0,y-2)*sw+x]+L[Math.min(sh-1,y+2)*sw+x])*.25;
   tones[i]=Math.max(0,Math.min(1,L[i]+(L[i]-mean)*p.edgeDetail*3));
  }
 }
 const luminance=(u,v)=>{const x=Math.max(0,Math.min(sw-1,u*(sw-1))),y=Math.max(0,Math.min(sh-1,v*(sh-1)));const ix=Math.floor(x),iy=Math.floor(y),xx=Math.min(sw-1,ix+1),yy=Math.min(sh-1,iy+1),a=x-ix,b=y-iy;return (tones[iy*sw+ix]*(1-a)+tones[iy*sw+xx]*a)*(1-b)+(tones[yy*sw+ix]*(1-a)+tones[yy*sw+xx]*a)*b;};
 const clock=(Number.isFinite(time)?time:0)*p.speed,frame=Math.floor(clock*12),seed=p.seed|0;
 const paths=Array.from({length:8},()=>new Path2D()),dots=Array.from({length:8},()=>new Path2D());
 const passes=id==='analogueWire'?2:1,n=Math.round(p.density),steps=plan.steps;
 for(let axis=0;axis<passes;axis++)for(let line=0;line<=n;line++){
  let previous=null;
  for(let j=0;j<=steps;j++){
   const u=axis?j/steps:line/n,v=axis?line/n:j/steps;
   const light=luminance(u,v),value=Math.max(0,(light-p.gate)/(1-p.gate));
   if(value<.025){previous=null;continue;}
   const noise=analogueHash(line,j,seed+frame),staticNoise=analogueHash(line,j,seed);
   const tear=Math.sin(v*39+clock*2.4+seed*.13)*Math.sin(v*113-clock*.8+seed*.07);
   let x=u*rw+((light-.15)*p.relief*rw*.115+p.jitter*rw*.014*tear)*shape;
   let y=v*rh+(axis?(light-.15)*p.relief*rh*.075*shape:0);
   if(coral){const wave=Math.sin(v*(80+p.frequency*240)+clock*3+light*9+seed*.01);x+=p.interference*rw*.045*wave*shape;}
   const dissolved=(id==='analogueDissolve'||rose||neon)&&staticNoise<p.dissolve*(rose?.55+.45*u:.18+.82*u)*(1-continuity);
   if(dissolved){const spread=(neon?.12:p.spread)*shape;x+=spread*rw*.34*Math.pow(staticNoise, .5)*( .6+.4*Math.sin(clock*.7+noise*6));y+=(noise-.5)*spread*rh*.14;}
   const band=Math.min(7,Math.floor(Math.pow(value,.65)*8));
   const broken=(id==='analoguePhosphor'&&noise<p.jitter*.48*(1-continuity))||(coral&&noise<p.interference*.24*(1-continuity));
   if(broken){previous=null;continue;}
   if(dissolved){const radius=Math.max(.45,p.width*.7)*(.5+noise)*(rose?p.grain:1);dots[band].moveTo(x+radius,y);dots[band].arc(x,y,radius,0,Math.PI*2);previous=null;}
   else {if(previous){paths[band].moveTo(previous[0],previous[1]);paths[band].lineTo(x,y);}previous=[x,y];}
  }
 }
 const ic=ink.getContext('2d');ic.clearRect(0,0,rw,rh);ic.lineJoin='round';ic.lineCap='round';
 function strokes(hue,offset,alpha,ctx=ic){ctx.save();ctx.translate(offset,0);ctx.globalAlpha=alpha;for(let i=0;i<8;i++){const colour=coral?p.secondaryHue+(hue-p.secondaryHue)*i/7:hue;ctx.strokeStyle=ctx.fillStyle=`hsl(${colour} ${rose?70:95}% ${rose?48+i*5:36+i*7}%)`;ctx.lineWidth=p.width*(.55+i*.12);ctx.stroke(paths[i]);ctx.fill(dots[i]);}ctx.restore();}
 ic.globalCompositeOperation='screen';
 if(id==='analoguePhosphor'){strokes(p.hue-65,-p.rgb*5*shape,.7);strokes(p.hue+90,p.rgb*5*shape,.7);}
 let glowInk=ink;
 if(neon){
  const halo=buffers.halo??=makeCanvas();if(halo.width!==rw||halo.height!==rh){halo.width=rw;halo.height=rh;}
  const hc=halo.getContext('2d');hc.clearRect(0,0,rw,rh);hc.lineJoin=hc.lineCap='round';
  strokes(p.haloHue,p.split*5*shape,1,hc);glowInk=halo;strokes(p.haloHue,p.split*5*shape,.65);
 }
 if(coral)strokes(p.secondaryHue,-p.interference*5*shape,.6);
 strokes(p.hue,0,1);
 c.fillStyle='#010207';c.fillRect(0,0,w,h);c.save();c.globalCompositeOperation='screen';
 const softness=.1+.9*(p.softness??1);
 if(p.glow>0){c.globalAlpha=Math.min(1,p.glow*.7);c.filter=`blur(${Math.max(1,w/rw*7*p.glow*softness)}px)`;c.drawImage(glowInk,0,0,w,h);c.globalAlpha=Math.min(1,p.glow);c.filter=`blur(${Math.max(.5,w/rw*2*p.glow*softness)}px)`;c.drawImage(glowInk,0,0,w,h);}
 c.filter='none';c.globalAlpha=1;c.drawImage(ink,0,0,w,h);c.restore();
 if(id==='analoguePhosphor'){c.save();c.fillStyle='#000';c.globalAlpha=.28;const pitch=Math.max(2,h/rh*3);for(let y=0;y<h;y+=pitch)c.fillRect(0,y,w,pitch*.25);c.restore();}
}
