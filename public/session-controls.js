// Extend the preserved editor. Previous work is recovered explicitly, never on startup.
function releaseSessionMedia(id){
 const item=media.get(id);if(!item)return;
 item.element.pause?.();item.audioNode?.disconnect();item.gain?.disconnect();
 item.element.removeAttribute?.('src');if(item.element instanceof HTMLVideoElement)item.element.load();
 URL.revokeObjectURL(item.url);media.delete(id);
}
function installSessionControls(){
 let previous=null;try{const p=JSON.parse(localStorage.getItem('bseg-moon-relic-project')||'null');if(p&&Array.isArray(p.layers)&&Array.isArray(p.effects))previous=p;}catch{}
 const busy=()=>{if(recording||$('recordVideo').disabled){notify('Finish or stop export before changing the session.');return true;}return false;};
 const clearMemory=()=>{D12_EPOCH++;for(const r of [renderer,pipeline.renderer]){r.historyReady=false;r.ritualProcessor?.clear();d12Free(r);}pickTracker=false;stage.classList.remove('picking');};
 const pauseAll=()=>{state.playing=false;for(const m of media.values())m.element.pause?.();audio.pause();};
 const stopAudio=()=>{audio.stopMic();audio.pause();if(audio.trackUrl)URL.revokeObjectURL(audio.trackUrl);audio.trackUrl=null;audio.mode='off';audio.audio.removeAttribute('src');audio.audio.load();$('audioFileLabel').textContent='No audio source';$('micButton').textContent='◎ Enable microphone';$('audioUpload').value='';};
 const oldStore=store;store=function(undo=true){oldStore(undo);try{localStorage.setItem('bseg-saved-recipes',JSON.stringify(state.customRecipes||[]));}catch{};};
 const snapshot=()=>{lastHistory=-1e9;store();lastHistory=-1e9;};
 const finish=message=>{clearMemory();refresh();updateSoundButton();$('qualitySelect').value=state.quality||'720';$('audioBand').value=state.audioBand||'off';$('audioGain').value=state.audioGain??.7;$('audioGainValue').textContent=Number(state.audioGain??.7).toFixed(2);store();window.__BSEG_UI__?.sync();render(state.time,{bass:0,mid:0,high:0,mix:0});notify(message);};
 function newSession(){
  if(busy())return;snapshot();previous=JSON.parse(JSON.stringify({...state,playing:false,time:0}));BSEG_SESSION_EPOCH++;pauseAll();stopAudio();
  for(const id of [...media.keys()])releaseSessionMedia(id);depthMaps.clear();trackers.clear();
  const recipes=state.customRecipes;state=starter();state.customRecipes=recipes||[];
  category='All';effectQuery='';libraryTab='effects';inspectorTab='fx';$('searchEffect').value='';$('mediaUpload').value='';$('mediaImportStatus').textContent='';
  setCanvas();finish('Fresh session. Undo restores the previous edit.');syncActions();
 }
 function clearVfx(){if(busy())return;if(!state.effects.length&&!state.layers.some(l=>l.effects?.length)){notify('No VFX to clear.');return;}snapshot();state.effects=[];state.layers.forEach(l=>l.effects=[]);state.selectedFx=0;state.audioBand='off';finish('All layer and master VFX cleared. Undo is available.');}
 function resetEffect(){if(busy())return;const fx=selectedEffect();if(!fx)return;snapshot();const reset={id:fx.id,amount:fx.id==='glitch'?.65:.86,enabled:true,keys:[],audioBand:'off',audioGain:1,...ritualSettings(fx.id)};if(D12[fx.id]){d12Defaults(reset);reset.deepDriver='off';reset.deepKeys={};}activeChain()[state.selectedFx]=reset;state.audioBand='off';finish('Selected effect reset, including animation and modulation.');}
 deleteLayer=function(){
  if(busy())return;const l=chosenLayer();if(!l)return;snapshot();BSEG_SESSION_EPOCH++;pauseAll();releaseSessionMedia(l.id);depthMaps.delete(l.id);trackers.delete(l.id);
  state.layers=state.layers.filter(x=>x.id!==l.id);state.layers.forEach(x=>{if(x.followTracker===l.id)x.followTracker='';});state.selectedLayer=state.layers.at(-1)?.id||'';state.selectedFx=0;
  if(!state.layers.length)state.fxScope='master';state.time=0;setCanvas();finish('Layer removed. Undo restores it.');
 };
 // Restore only assets still belonging to the current state. A late decode cannot re-add a removed source.
 restoreMedia=async function(){const epoch=BSEG_SESSION_EPOCH,list=state.layers.slice();for(const l of list){if(epoch!==BSEG_SESSION_EPOCH)return;try{if(l.assetId&&!media.has(l.id)){const blob=await getAsset(l.assetId);if(epoch!==BSEG_SESSION_EPOCH)return;if(blob)await attachMedia(l,blob,false);else notify(`Missing media for ${l.name}. Re-import the source.`);}if(l.depthAssetId&&!depthMaps.has(l.id)){const blob=await getAsset(l.depthAssetId);if(epoch!==BSEG_SESSION_EPOCH)return;if(blob)await attachDepthMap(l,blob,false);}}catch(e){if(epoch===BSEG_SESSION_EPOCH)notify(`Could not restore ${l.name}: ${e.message}`);}}};
 const oldHistory=historyStep;historyStep=function(dir){if(busy())return;const to=historyIndex+dir;if(to<0||to>=history.length)return;BSEG_SESSION_EPOCH++;pauseAll();oldHistory(dir);for(const id of [...media.keys()])if(!state.layers.some(l=>l.id===id))releaseSessionMedia(id);clearMemory();updateSoundButton();syncActions();};
 async function recover(){if(busy()||!previous)return;snapshot();const p=previous;BSEG_SESSION_EPOCH++;pauseAll();stopAudio();for(const id of [...media.keys()])releaseSessionMedia(id);depthMaps.clear();trackers.clear();state=normalizeState(p);setCanvas();await restoreMedia();finish('Previous session restored. Missing source files may need re-importing.');}
 const makeButton=(id,text,action,title)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='btn ghost';b.textContent=text;b.title=title||text;b.onclick=action;return b;};
 const box=document.createElement('section');box.className='session-tools';box.setAttribute('aria-label','Session controls');
 const heading=document.createElement('p');heading.textContent='Opens fresh each time. Saved recipes stay available.';box.append(heading);
 const newButton=$('newProject');newButton.textContent='New session';newButton.onclick=newSession;box.append(newButton);
 box.append(makeButton('recoverSession','Restore previous session',recover),makeButton('clearAllVfx','Clear all VFX',clearVfx),makeButton('removeSessionLayer','Remove selected layer',()=>deleteLayer()));
 document.querySelector('.pro-tools .pro-panel-title').after(box);
 const clear=makeButton('quickClearVfx','Clear VFX',clearVfx,'Remove all VFX from every layer and the master output; Undo is available');document.querySelector('.pro-active-line').append(clear);
 const oldInspector=renderInspector;renderInspector=function(){oldInspector();const fx=selectedEffect();if(fx){const actions=document.createElement('div');actions.className='session-effect-actions';actions.append(makeButton('resetSelectedEffect','Reset selected effect',resetEffect));$('effectInspector').prepend(actions);}const l=chosenLayer();if(l)$('layerInspector').prepend(makeButton('removeInspectorLayer','Remove this layer',()=>deleteLayer()));syncActions();};
 function syncActions(){if(!selectedEffect()){$('proStrength').value='0';$('proStrengthNumber').value='0';$('proBypass').setAttribute('aria-pressed','false');$('proBypass').textContent='Bypass';}const l=chosenLayer();$('removeSessionLayer').disabled=!l;$('recoverSession').disabled=!previous;clear.disabled=!state.effects.length&&!state.layers.some(l=>l.effects?.length);$('clearAllVfx').disabled=clear.disabled;}
 $('deleteLayer').onclick=()=>deleteLayer();
 const style=document.createElement('style');style.textContent='.session-tools{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;padding:10px;border:1px solid #716b88;border-radius:9px;background:#151526}.session-tools p{width:100%;margin:0 0 4px;font-size:12px;line-height:1.4}.session-tools .btn{min-height:40px;white-space:normal;flex:1 1 130px}.session-effect-actions{margin:0 0 10px}.session-effect-actions .btn,#removeInspectorLayer{min-height:40px;width:100%;margin-bottom:8px}#quickClearVfx{font:10px system-ui;padding:3px 6px;min-height:26px;flex-shrink:0}.pro-active-line{gap:5px}.pro-active-line #proActiveName{min-width:0}';document.head.append(style);
 Object.assign(window.__VFX02_TEST__,{newSession,clearVfx,resetEffect,deleteLayer,restoreMedia,sessionResources:()=>({media:media.size,depth:depthMaps.size,trackers:trackers.size,audio:audio.mode})});
 window.addEventListener('pagehide',()=>{pauseAll();});
 renderInspector();syncActions();
}
installSessionControls();
