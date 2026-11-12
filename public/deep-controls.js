// Added inside the existing module. No separate demo and no third-party runtime dependencies.
function installDepthLab(){
 const legacyAdd=addFx,legacyAdvanced=advancedControls,legacyEffective=effectiveFx,legacyKey=setKeyframe,legacySeek=seek,legacyInspector=renderInspector;
 const mutableKeys=fx=>D12[fx.id]?.controls.map(c=>'deep_'+c[0])||[];
 const edit=fn=>{lastHistory=-1e9;store();fn();lastHistory=-1e9;refresh();store();};
 const specFor=()=>D12[selectedEffect()?.id];
 const selected=()=>selectedEffect();
 addFx=function(id){legacyAdd(id);const f=selected();if(D12[id]){d12Defaults(f);renderInspector();store(false);}};
 seek=function(t){D12_EPOCH++;return legacySeek(t);};
 effectiveFx=function(fx,t,bands){
  const out=legacyEffective(fx,t,bands),spec=fx.d12===1&&D12[fx.id];if(!spec)return out;
  for(const[k,,min,max,step,def]of spec.controls){const key='deep_'+k;let value=sample(key,fx.deepKeys?.[key],t,fx[key]??def);
   if(fx.deepTarget===key&&fx.deepDriver&&fx.deepDriver!=='off'){
    const hz=fx.deepSync?(fx.deepBpm??120)/60*(fx.deepRate??.5):fx.deepRate??.5;
    const phase=t*hz,driver=fx.deepDriver;
    const wave=driver==='sine'?Math.sin(phase*Math.PI*2):driver==='triangle'?1-4*Math.abs(((phase+.25)%1+1)%1-.5):Math.max(0,bands[driver]||0);
    value+=wave*(max-min)*.5*(fx.deepMotion??.2);
   }
   value=d12Clamp(value,min,max);out[key]=step>=1?Math.round(value/step)*step:value;
  }
  return out;
 };
 setKeyframe=function(scope,key){const fx=selected();if(scope!=='effect'||!fx||fx.d12!==1||!mutableKeys(fx).includes(key))return legacyKey(scope,key);
  edit(()=>{const t=Math.round(state.time*100)/100;fx.deepKeys??={};fx.deepKeys[key]=(fx.deepKeys[key]||[]).filter(k=>Math.abs(k.t-t)>.005).concat({t,v:fx[key]});});
  notify('Parameter keyframe set. Set another value later in the timeline to animate.');
 };
 function look(index){const fx=selected(),spec=specFor();if(!fx||!spec)return;
  edit(()=>{d12Defaults(fx);const i=(index+spec.looks.length)%spec.looks.length,p=spec.looks[i];fx.deepLook=i;
   spec.controls.forEach(([k],j)=>{if(!fx.deepLocks?.['deep_'+k]){fx['deep_'+k]=p[1][j];if(fx.deepKeys)delete fx.deepKeys['deep_'+k];}});
   if(spec.colors){if(!fx.deepLocks?.colors){fx.deepColor0=p[2];fx.deepColor1=p[3];}}
   D12_EPOCH++;
  });
 }
 let copiedSettings;
 function seededRandom(seed){
  let state=2166136261;
  for(const character of seed)state=Math.imul(state^character.codePointAt(0),16777619);
  return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 }
 function vary(seed){const fx=selected(),spec=specFor();if(!fx||!spec)return;
  const random=seed ? seededRandom(seed) : Math.random;
  edit(()=>{d12Defaults(fx);for(const[k,,min,max,step,def]of spec.controls){const key='deep_'+k;if(fx.deepLocks?.[key])continue;
   fx[key]=d12Clamp(Math.round(((seed?def:fx[key])+(random()-.5)*(max-min)*.24)/step)*step,min,max);if(fx.deepKeys)delete fx.deepKeys[key];}
   fx.deepLook=-1;D12_EPOCH++;
  });
 }
 const row=(fx,[key,label,min,max,step,def,unit])=>{
  const prop='deep_'+key,locked=!!fx.deepLocks?.[prop],hasKeys=!!fx.deepKeys?.[prop]?.length;
  return `<div class="depth-param"><div class="depth-param-title"><span>${esc(label)}</span><button type="button" data-depth-lock="${prop}" aria-pressed="${locked}" title="${locked?'Unlock':'Lock'} this parameter during look browsing and variation">${locked?'Locked':'Lock'}</button><button type="button" class="keybtn" data-keyframe="effect:${prop}" title="Add a keyframe at the playhead">${hasKeys?'◆':'◇'}</button>${hasKeys?`<button type="button" data-depth-clear="${prop}" title="Remove parameter animation">Clear keys</button>`:''}</div>${rangeControl(label,prop,fx[prop]??def,min,max,step,unit,false,'effect')}</div>`;
 };
 const options=(items,value)=>items.map(([v,t])=>`<option value="${v}" ${String(v)===String(value)?'selected':''}>${t}</option>`).join('');
 advancedControls=function(fx){const spec=D12[fx.id];if(!spec)return legacyAdvanced(fx);
  if(fx.d12!==1)return legacyAdvanced(fx)+`<div class="depth-card"><p>This saved effect is using its original processor.</p><button class="btn" type="button" data-depth-upgrade>Enable deep controls</button><p class="hint">Keeps your stack and mix. The look may change; Undo restores it.</p></div>`;
  const lookName=spec.looks[fx.deepLook??0]?.[0]||'Custom variation';
  return `<section class="depth-card" aria-label="Deep effect controls"><div class="depth-heading">DEPTH LAB / ${spec.temporal?'FRAME MEMORY':'SIGNAL DESIGN'}</div>
   <div class="depth-look"><button type="button" data-depth-prev aria-label="Previous look">‹</button><strong>${esc(lookName)}</strong><button type="button" data-depth-next aria-label="Next look">›</button></div>
   <div class="depth-actions"><button type="button" data-depth-vary>✧ Vary unlocked</button><button type="button" data-depth-reset>Reset</button><button type="button" data-depth-copy>Duplicate</button></div>
   <details class="depth-section"><summary>Reuse settings</summary>
    <div class="depth-actions"><button type="button" data-depth-reuse="copy">Copy settings</button><button type="button" data-depth-reuse="paste">Paste settings</button></div>
    <div class="depth-actions"><button type="button" data-depth-reuse="effect">Save effect</button><button type="button" data-depth-reuse="stack">Save stack</button></div>
    <label class="field-label">Variation seed<input class="field" data-depth-seed maxlength="80" placeholder="Enter a seed"></label>
    <div class="depth-actions"><button type="button" data-depth-reuse="seed">Apply seed</button></div>
   </details>
   ${!renderer.gl?'<p class="depth-note">These deep processors need WebGL2. Your settings are retained, but this browser cannot render them.</p>':''}
   ${spec.controls.map(c=>row(fx,c)).join('')}
   ${spec.colors?`<div class="depth-colors"><label>Shadow ink<input type="color" data-depth-color="deepColor0" value="${fx.deepColor0||'#16112f'}"></label><label>Highlight ink<input type="color" data-depth-color="deepColor1" value="${fx.deepColor1||'#e5c9fa'}"></label></div>`:''}
   <details class="depth-section"><summary>Blend & tonal mask</summary><label class="field-label">Effect blend</label><select class="field" data-depth-numeric="deepBlend">${options([[0,'Normal'],[1,'Screen'],[2,'Add'],[3,'Multiply'],[4,'Difference']],fx.deepBlend||0)}</select><label class="field-label">Apply to</label><select class="field" data-depth-numeric="deepRegion">${options([[0,'Whole image'],[1,'Highlights'],[2,'Shadows']],fx.deepRegion||0)}</select>${rangeControl('Mask threshold','deepThreshold',fx.deepThreshold??.5,0,1,.01,'',false,'effect')}${rangeControl('Mask feather','deepFeather',fx.deepFeather??.15,.01,.5,.01,'',false,'effect')}</details>
   <details class="depth-section"><summary>Motion & sound modulation</summary><label class="field-label">Parameter to drive</label><select class="field" data-depth-select="deepTarget"><option value="">None</option>${spec.controls.map(([k,label])=>`<option value="deep_${k}" ${fx.deepTarget==='deep_'+k?'selected':''}>${esc(label)}</option>`).join('')}</select><label class="field-label">Driver</label><select class="field" data-depth-select="deepDriver">${options([['off','Off'],['sine','Sine motion'],['triangle','Triangle motion'],['bass','Audio: bass'],['mid','Audio: mids'],['high','Audio: treble'],['mix','Audio: full mix']],fx.deepDriver||'off')}</select>${rangeControl('Modulation depth','deepMotion',fx.deepMotion??.2,0,1,.01,'',false,'effect')}${rangeControl('Rate / beat multiplier','deepRate',fx.deepRate??.5,.05,4,.05,'',false,'effect')}<label class="toggle"><input type="checkbox" data-depth-sync ${fx.deepSync?'checked':''}> Sync motion rate to manual BPM</label>${rangeControl('Tempo','deepBpm',fx.deepBpm??120,40,240,1,' BPM',false,'effect')}<p class="hint">Press Play for motion. Load audio in the Audio tab for sound drivers. BPM is manual, not automatic beat detection. Modulation adds to the stored/keyframed value.</p></details>
   <p class="depth-note">${esc(spec.note||'Independent, editable controls. Lock parameters to protect them while exploring looks.')} ${spec.temporal?'Memory buffers are bounded to 640 pixels on the long edge; the current frame renders at the chosen output resolution.':''}</p>
  </section>`;
 };
 renderInspector=function(){legacyInspector();if(selected()?.d12===1){const p=$('effectInspector').querySelector('.detailcard>p');if(p)p.textContent=EFFECT_BY_ID[selected().id].desc+'. Independent Depth Lab processor.';}};
 const root=$('effectInspector');
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const fx=selected(),spec=specFor();if(!fx||!spec)return;
  if(b.hasAttribute('data-depth-upgrade'))edit(()=>d12Defaults(fx));
  else if(b.dataset.depthLock){fx.deepLocks??={};fx.deepLocks[b.dataset.depthLock]=!fx.deepLocks[b.dataset.depthLock];renderInspector();store();}
  else if(b.dataset.depthClear)edit(()=>{if(fx.deepKeys)delete fx.deepKeys[b.dataset.depthClear];});
  else if(b.hasAttribute('data-depth-prev'))look((fx.deepLook??0)-1);
  else if(b.hasAttribute('data-depth-next'))look((fx.deepLook??0)+1);
  else if(b.hasAttribute('data-depth-vary'))vary();
  else if(b.hasAttribute('data-depth-reset'))edit(()=>{spec.controls.forEach(([k,,,,,v])=>fx['deep_'+k]=v);fx.deepKeys={};fx.deepDriver='off';fx.deepBlend=0;fx.deepRegion=0;fx.deepLook=0;D12_EPOCH++;});
  else if(b.dataset.depthReuse==='copy'){
   copiedSettings=structuredClone(fx);
   delete copiedSettings.d12Token;
   notify('Effect settings copied for this session.');
  }
  else if(b.dataset.depthReuse==='paste'){
   if(copiedSettings?.id!==fx.id){notify('Copy settings from the same effect type first.');return;}
   edit(()=>{
    const replacement={...structuredClone(copiedSettings),d12Token:fx.d12Token};
    activeChain()[state.selectedFx]=replacement;
    D12_EPOCH++;
   });
   notify('Effect settings pasted.');
  }
  else if(b.dataset.depthReuse==='seed'){
   const seed=b.closest('details').querySelector('[data-depth-seed]').value.trim();
   if(!seed){notify('Enter a seed to repeat this variation.');return;}
   vary(seed);
   const field=root.querySelector('[data-depth-seed]');
   if(field)field.value=seed;
  }
  else if(b.dataset.depthReuse==='effect'||b.dataset.depthReuse==='stack'){
   const name=window.prompt('Name this memory slot',EFFECT_BY_ID[fx.id].name)?.trim();
   if(name)saveCustomRecipe(name,b.dataset.depthReuse==='effect'?[fx]:activeChain());
  }
  else if(b.hasAttribute('data-depth-copy'))edit(()=>{const copy=structuredClone(fx);copy.d12Token=newid();activeChain().splice(state.selectedFx+1,0,copy);state.selectedFx++;});
 });
 root.addEventListener('change',e=>{const fx=selected();if(!fx)return;const t=e.target;
  if(t.dataset.depthSelect)edit(()=>fx[t.dataset.depthSelect]=t.value);
  else if(t.dataset.depthNumeric)edit(()=>fx[t.dataset.depthNumeric]=Number(t.value));
  else if(t.dataset.depthColor)edit(()=>fx[t.dataset.depthColor]=t.value);
  else if(t.hasAttribute('data-depth-sync'))edit(()=>fx.deepSync=t.checked);
 });
 // Holding Compare changes rendering only. It never rewrites or exports an altered project.
 let comparing=false;const originalRender=render;
 render=function(t,bands){if(!comparing)return originalRender(t,bands);const master=state.effects,layers=state.layers.map(l=>l.effects);try{state.effects=[];state.layers.forEach(l=>l.effects=[]);originalRender(t,bands);}finally{state.effects=master;state.layers.forEach((l,i)=>l.effects=layers[i]);}};
 const compare=document.createElement('button');compare.type='button';compare.className='depth-compare';compare.id='depthCompare';compare.textContent='Hold: before';compare.setAttribute('aria-label','Hold to compare without effects');compare.setAttribute('aria-pressed','false');
 document.querySelector('.pro-quick-head')?.append(compare);
 const compareOn=()=>{if(recording)return;comparing=true;compare.setAttribute('aria-pressed','true');};const compareOff=()=>{if(comparing){comparing=false;D12_EPOCH++;compare.setAttribute('aria-pressed','false');}};
 compare.addEventListener('pointerdown',e=>{e.preventDefault();compare.setPointerCapture(e.pointerId);compareOn();});['pointerup','pointercancel','lostpointercapture','blur'].forEach(ev=>compare.addEventListener(ev,compareOff));
 compare.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();compareOn();}});compare.addEventListener('keyup',compareOff);window.addEventListener('blur',compareOff);document.addEventListener('visibilitychange',()=>{if(document.hidden)compareOff();});
 const report = {version:'012',families:Object.keys(D12),parameterCount:Object.values(D12).reduce((n,d)=>n+d.controls.length,0),lookCount:Object.values(D12).reduce((n,d)=>n+d.looks.length,0)};
 // Editable recipes complement per-effect looks; saving a memory retains all deep settings.
 const recipe=(id,name,effects)=>({id,name,subtitle:'Editable Depth Lab stack',tags:'DEEP / EDITABLE',effects:effects.map(([id,amount,lookIndex=0])=>{const f=d12Defaults({id,amount,enabled:true,keys:[]});D12[id].controls.forEach(([k],i)=>f['deep_'+k]=D12[id].looks[lookIndex][1][i]);f.deepLook=lookIndex;return f;})});
 RECIPES.push(recipe('d12-pearl','PEARL / GLASS HALO',[['crystalglass',.45,0],['bloom',.65,0]]),recipe('d12-silver','SILVER / SPECTRAL PRINT',[['duotonepro',.9,1],['chromatic',.35,0]]),recipe('d12-cathedral','CATHEDRAL / REFRACTION',[['kaleido',.85,1],['crystalglass',.4,2],['anamorphic',.5,1]]),recipe('d12-comet','COMET / MOTION MEMORY',[['trails',.8,1],['anamorphic',.5,0]]),recipe('d12-apparition','APPARITION / DEPTH',[['depth',.8,1],['echo',.55,0]]),recipe('d12-liquid','MERCURY / LIVING LIGHT',[['ripple',.75,1],['chromatic',.4,2],['bloom',.4,1]]));
 document.querySelector('[data-library-tab="effects"] small').textContent=String(EFFECTS.length);
 const styles=document.createElement('style');styles.textContent=`.depth-card{border:1px solid #887097;border-radius:9px;padding:10px;margin:12px 0;background:#0e1326}.depth-heading{font:8px monospace;letter-spacing:.14em;color:#d8bde8}.depth-look{display:flex;align-items:center;gap:7px;margin:10px 0}.depth-look strong{flex:1;font:italic 17px Georgia;color:#f0dced}.depth-look button,.depth-actions button,.depth-param-title button,.depth-compare{border:1px solid #6f5b84;border-radius:5px;background:#20203b;color:#e7d1f8;padding:6px 8px;font:10px system-ui;min-height:30px}.depth-actions{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}.depth-param-title{display:flex;gap:4px;align-items:center;font:11px system-ui;color:#e9d7f3;margin-top:10px}.depth-param-title>span{flex:1}.depth-param-title button{padding:4px;font-size:9px;min-height:28px}.depth-param-title button[aria-pressed=true]{background:#4a3458;border-color:#ddb3ec}.depth-param>.controlrow>label{font-size:0}.depth-param>.controlrow{margin-top:1px!important}.depth-section{border-top:1px solid #4c405f;margin-top:14px;padding-top:9px}.depth-section summary{font:11px system-ui;color:#dac0ef;cursor:pointer;padding:7px 0}.depth-note{font:10px/1.6 system-ui;color:#b5b2cf;margin-top:12px}.depth-colors{display:flex;gap:12px;font:10px system-ui}.depth-colors input{display:block;width:70px;height:30px;margin-top:5px}.depth-compare{font-size:9px;padding:4px 7px;min-height:24px;touch-action:none;white-space:nowrap}.depth-compare[aria-pressed=true]{background:#5c465c}.pro-quick-head{gap:5px}.depth-card .rangefull{height:28px!important}@media(max-width:600px){.depth-card{padding:8px}.depth-look strong{font-size:16px}.depth-compare{font-size:8px;padding:3px 5px;min-height:22px}}`;
 document.head.append(styles);
 Object.assign(window.__VFX02_TEST__,{addEffect:addFx,selectRecipe:setRecipe,seek,renderFrame:t=>render(t,{bass:0,mid:0,high:0,mix:0})});
 window.__BSEG_DEPTH__={...report,specs:D12,getSelected:()=>selected(),evaluate:(f,t,b)=>effectiveFx(f,t,b||{}),setKey:(k)=>setKeyframe('effect',k),look,vary,compare:(on)=>on?compareOn():compareOff(),resetMemory:()=>D12_EPOCH++,undo:()=>historyStep(-1),serialize:()=>JSON.stringify(state),restoreJSON:j=>{state=normalizeState(JSON.parse(j));D12_EPOCH++;refresh();},stats:()=>[renderer,pipeline.renderer].map(r=>({entries:r.deepMemory?.size||0,bytes:[...(r.deepMemory?.values()||[])].reduce((n,e)=>n+e.w*e.h*8,0)}))};
 refresh();
}
installDepthLab();
