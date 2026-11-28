/* Preview-only handles; the renderer owns the actual original-image rectangle. */
(()=>{
 const stage=$('stage'),screen=stage.parentElement,box=document.createElement('div');
 box.id='analogueWindowHandle';box.tabIndex=0;box.setAttribute('role','group');box.setAttribute('aria-label','Move original footage window');box.title='Drag to move; arrow keys move; Shift + arrows move faster';
 box.style.cssText='position:absolute;z-index:15;border:1px dashed #f1e9ff;box-shadow:0 0 0 1px #141024;cursor:move;touch-action:none;display:none;box-sizing:border-box;';
 const label=document.createElement('span');label.textContent='Original';label.style.cssText='position:absolute;top:2px;left:4px;font:10px monospace;color:white;background:#171323b8;padding:2px;pointer-events:none';
 const handle=document.createElement('button');handle.type='button';handle.setAttribute('aria-label','Resize original footage window');handle.textContent='↘';handle.style.cssText='position:absolute;right:-10px;bottom:-10px;width:28px;height:28px;cursor:nwse-resize;touch-action:none;color:white;background:#282035;border:1px solid #c9badc;border-radius:5px;';
 box.append(label,handle);screen.append(box);
 let gesture=null;
 function selected(){const f=selectedEffect();return inspectorTab==='fx'&&f?.id==='analogueOriginalWindow'&&f.enabled!==false?f:null;}
 function checkpoint(){lastHistory=-1e9;store();lastHistory=-1e9;}
 function sync(){
  const f=selected();box.style.display=f&&!recording?'block':'none';
  if(f&&!recording){const a=stage.getBoundingClientRect(),b=screen.getBoundingClientRect(),r=analogueWindowRect(ritualSettings(f.id,f),a.width,a.height);Object.assign(box.style,{left:(a.left-b.left+r.x)+'px',top:(a.top-b.top+r.y)+'px',width:r.w+'px',height:r.h+'px'});}
  requestAnimationFrame(sync);
 }
 box.addEventListener('pointerdown',e=>{if(e.button!==0||recording)return;const f=selected();if(!f)return;e.preventDefault();e.stopPropagation();checkpoint();const a=stage.getBoundingClientRect();gesture={f,start:{...ritualSettings(f.id,f)},x:e.clientX,y:e.clientY,w:a.width,h:a.height,resize:e.target===handle,pointer:e.pointerId};box.setPointerCapture(e.pointerId);box.focus();});
 box.addEventListener('pointermove',e=>{const g=gesture;if(!g||e.pointerId!==g.pointer||selectedEffect()!==g.f)return;const dx=(e.clientX-g.x)/g.w,dy=(e.clientY-g.y)/g.h,p=g.start;
  const r=analogueWindowRect(p,1,1);
  if(g.resize){g.f.windowW=Math.max(.05,Math.min(1-r.x,p.windowW+dx));g.f.windowH=Math.max(.05,Math.min(1-r.y,p.windowH+dy));g.f.windowX=r.x+g.f.windowW/2;g.f.windowY=r.y+g.f.windowH/2;}
  else{g.f.windowX=Math.max(p.windowW/2,Math.min(1-p.windowW/2,r.x+p.windowW/2+dx));g.f.windowY=Math.max(p.windowH/2,Math.min(1-p.windowH/2,r.y+p.windowH/2+dy));}
 });
 function finish(e){if(!gesture||e.pointerId!==gesture.pointer)return;const g=gesture;gesture=null;if(e.type==='pointercancel')Object.assign(g.f,g.start);else{lastHistory=-1e9;store();}renderInspector();}
 box.addEventListener('pointerup',finish);box.addEventListener('pointercancel',finish);box.addEventListener('lostpointercapture',e=>{if(gesture)finish(e);});
 box.addEventListener('keydown',e=>{const f=selected();if(!f||recording||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopPropagation();checkpoint();const p=ritualSettings(f.id,f),delta=e.shiftKey?.05:.005,key=e.key.includes('Left')||e.key.includes('Right')?'windowX':'windowY',size=key==='windowX'?p.windowW:p.windowH;f[key]=Math.max(size/2,Math.min(1-size/2,p[key]+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-delta:delta)));store();renderInspector();});
 const previous=renderInspector;renderInspector=function(){previous();const f=selected();if(!f)return;const button=document.createElement('button');button.type='button';button.className='btn ghost fill';button.textContent='Make window square';button.onclick=()=>{if(recording)return;checkpoint();const p=ritualSettings(f.id,f),side=Math.min(p.windowW*stage.width,stage.width,stage.height);f.windowW=side/stage.width;f.windowH=side/stage.height;renderInspector();store();};$('effectInspector').prepend(button);};
 requestAnimationFrame(sync);
})();
