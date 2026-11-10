/* BSEG 008 — UI extension, appended to the existing engine module by apply-console.mjs. */
function mountProConsole() {
  const app=$('app'), workspace=document.querySelector('.workspace'), center=document.querySelector('.center');
  const library=document.querySelector('.library'), inspector=document.querySelector('.inspector');
  if (!app || app.dataset.consoleVersion==='008') return;
  app.dataset.consoleVersion='008';
  document.body.classList.add('pro-console');
  const mobile=matchMedia('(max-width:1000px)');
  let panel='effects';
  const make=(tag,attrs={},html='')=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);e.innerHTML=html;return e;};
  const move=(selector,target)=>{const el=document.querySelector(selector);if(el)target.append(el);return el;};

  // Keep the actual existing controls and handlers. Move secondary source creation into Tools.
  const tools=make('section',{class:'pro-tools pro-panel','data-pro-panel':'tools','aria-label':'Project and source tools'},'<header class="pro-panel-title"><span>04 / PROJECT</span><h2>Tools & output</h2></header>');
  const toolsClose=make('button',{class:'pro-tools-close',type:'button','aria-label':'Close tools'},'×');
  tools.prepend(toolsClose);
  move('.project-meta',tools);
  const sources=make('details',{class:'pro-secondary',open:''},'<summary>Source tools <span>Image · video · type · geometry</span></summary>');
  move('.import-grid',sources);move('.media-help',sources);move('#mediaImportStatus',sources);tools.append(sources);
  const output=make('details',{class:'pro-secondary',open:''},'<summary>Canvas & output <span>Aspect ratio and render resolution</span></summary>');
  move('.stage-options',output);tools.append(output);
  const projectActions=make('div',{class:'pro-project-actions'});
  ['#newProject','label[for="projectUpload"]','#projectUpload','#saveProject','#exportPng'].forEach(s=>move(s,projectActions));
  output.append(projectActions);
  tools.append(make('p',{class:'pro-local-note'},'Media is processed on your device. Large sources and 4K output need more memory; use HD while editing on a phone.'));
  workspace.append(tools);
  toolsClose.onclick=()=>{document.body.classList.remove('pro-tools-open');setPanel('effects');};

  document.querySelector('.library .panelhead h2').textContent='Effects';
  document.querySelector('.library .panelhead .eyebrow').textContent='01 / PROCESSORS';
  document.querySelector('.inspectorhead h2').textContent='Parameters';
  document.querySelector('.inspectorhead .eyebrow').textContent='03 / SIGNAL CONTROL';
  document.querySelector('.stage-label .eyebrow').textContent='02 / LIVE COMPOSITE';
  document.querySelector('.sys-bus-code').textContent='BSEG 008 / SPECTRAL CONSOLE';
  document.querySelector('.brand-num').textContent='// SPECTRAL CONSOLE 008';
  document.querySelector('.guardian-caption').textContent='SPECTRAL PROTECTOR';
  document.querySelector('.guardian-portrait').setAttribute('aria-label','Guardian artwork from the supplied console reference');
  document.querySelector('.guardian-portrait img').alt='Guardian artwork from the approved console reference';
  document.querySelector('.brand-credit').innerHTML='by <strong>GHOSTGIRL <span lang="zh-Hans">空舞</span></strong>';
  $('openMedia').textContent='＋ Import';$('recordVideo').textContent='↗ Export video';
  $('openMedia').setAttribute('aria-label','Import image or video');
  const toolsButton=make('button',{class:'btn ghost',type:'button',id:'proToolsButton','aria-expanded':'false'},'Tools');
  document.querySelector('.head-actions').append(toolsButton);
  toolsButton.onclick=()=>{if(mobile.matches)setPanel('tools');else{document.body.classList.toggle('pro-tools-open');toolsButton.setAttribute('aria-expanded',String(document.body.classList.contains('pro-tools-open')));}};

  const timeline=move('.timeline',workspace);
  timeline.classList.add('pro-panel');timeline.dataset.proPanel='layers';
  timeline.setAttribute('aria-label','Layers and timeline');
  const timelineTitle=timeline.querySelector('.timelinehead h3');if(timelineTitle){timelineTitle.childNodes[0].textContent='Timeline ';}
  library.classList.add('pro-panel');library.dataset.proPanel='effects';
  inspector.classList.add('pro-panel');inspector.dataset.proPanel='tune';
  const tabs=make('nav',{class:'pro-tabs','aria-label':'Editor panels'},['effects','tune','layers','tools'].map((v,i)=>`<button type="button" data-pro-tab="${v}" aria-pressed="${i===0}"><span>${['✧','☷','▱','⌘'][i]}</span>${['Effects','Tune','Layers','Tools'][i]}</button>`).join(''));
  workspace.append(tabs);
  function setPanel(value){panel=value;workspace.dataset.panel=value;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.proTab===value)));if(mobile.matches)document.body.classList.remove('pro-tools-open');}
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-pro-tab]');if(b)setPanel(b.dataset.proTab);});
  setPanel(panel);mobile.addEventListener('change',()=>{setPanel(panel);fitPreview();});

  // A persistent, direct-access effects row. Repeat taps select the existing processor instead of duplicating it.
  const core=[['echo','Echo'],['trails','Trails'],['chromatic','Prism'],['bloom','Glow'],['squeeze','Distort'],['depth','Depth'],['timewarp','Time'],['caustic','Liquid']];
  const quick=make('section',{class:'pro-quick','aria-label':'Always-visible main effects'},'<div class="pro-quick-head"><span>CORE EFFECTS</span><button type="button" id="proScope" title="Switch effect target"></button></div><div class="pro-core-scroll" role="group" aria-label="Core effect shortcuts">'+core.map(([id,label])=>`<button type="button" data-core-fx="${id}" aria-pressed="false"><span>${EFFECT_BY_ID[id]?.icon||'◇'}</span>${label}</button>`).join('')+'</div>');
  const quickTune=make('div',{class:'pro-quick-tune'},'<div class="pro-active-line"><strong id="proActiveName">Select an effect</strong><button type="button" id="proBypass" disabled aria-pressed="false">Bypass</button></div><label class="pro-strength-row"><span>Mix</span><input type="range" id="proStrength" aria-label="Selected effect mix" min="0" max="1" step="0.01" value="0" disabled><input type="number" id="proStrengthNumber" aria-label="Selected effect mix percent" min="0" max="100" step="1" value="0" disabled><span>%</span></label>');
  center.append(quick,quickTune);
  quick.addEventListener('click',e=>{const b=e.target.closest('[data-core-fx]');if(!b)return;const chain=activeChain(),idx=chain.findIndex(f=>f.id===b.dataset.coreFx);if(idx<0)addFx(b.dataset.coreFx);else{state.selectedFx=idx;inspectorTab='fx';renderInspector();}syncPro();});
  $('proScope').onclick=()=>{state.fxScope=state.fxScope==='layer'?'master':'layer';state.selectedFx=0;renderInspector();store();syncPro();};
  function mix(value){const fx=selectedEffect();if(!fx)return;fx.amount=Math.max(0,Math.min(1,Number(value)||0));store();const input=$('effectInspector').querySelector('[data-effect-prop="amount"]');if(input)input.value=fx.amount;const label=$('effectInspector').querySelector('[data-value-for="amount"]');if(label)label.textContent=fx.amount.toFixed(2);syncPro();}
  $('proStrength').oninput=e=>mix(e.target.value);
  $('proStrengthNumber').onchange=e=>mix(Number(e.target.value)/100);
  $('proStrength').onchange=()=>renderInspector();
  $('proBypass').onclick=()=>{const fx=selectedEffect();if(fx){fx.enabled=fx.enabled===false;renderInspector();store();syncPro();}};

  // All effects remain searchable; the old initial filter was hiding most of the library.
  category='All';renderLibrary();
  const count=document.querySelector('[data-library-tab="effects"] small');if(count)count.textContent=String(EFFECTS.length);
  const libraryName=document.querySelector('#effectsLibrary .section-caption span');if(libraryName)libraryName.textContent='PROCESSOR LIBRARY';
  const renderBadge=make('span',{class:'pro-render-badge',id:'proRenderBadge'},renderer.gl?'GPU / WEBGL2':'LIMITED / CANVAS');
  document.querySelector('.stage-top').append(renderBadge);
  $('searchEffect').setAttribute('aria-label','Search all effects');
  const help=make('div',{class:'pro-capability-note',role:'status'},'WebGL2 is unavailable in this browser. The five Tibetan-inspired processors still work; other processors need WebGL2.');
  help.hidden=!!renderer.gl;library.insertBefore(help,$('effectsLibrary'));

  // Number entry is paired with each existing slider, not an extra cosmetic control.
  function numericControls(){
    for(const root of [$('effectInspector'),$('layerInspector')])for(const range of root.querySelectorAll('input[type="range"]')){
      if(range.dataset.proNumber)return;
      const key=range.dataset.effectProp||range.dataset.layerProp;
      if(!key)continue;
      range.dataset.proNumber='true';
      const number=make('input',{type:'number',class:'pro-value-input',min:range.min,max:range.max,step:range.step,'aria-label':`${key} precise value`});number.value=range.value;
      const row=range.previousElementSibling;row?.querySelector('.value')?.replaceWith(number);
      range.addEventListener('input',()=>{number.value=range.value;});
      number.addEventListener('change',()=>{const v=Number(number.value);if(!Number.isFinite(v)){number.value=range.value;return;}range.value=String(Math.min(Number(range.max),Math.max(Number(range.min),v)));range.dispatchEvent(new Event('input',{bubbles:true}));number.value=range.value;syncPro();});
    }
  }
  let syncPending=false;
  function scheduleSync(){if(syncPending)return;syncPending=true;requestAnimationFrame(()=>{syncPending=false;syncPro();numericControls();});}
  new MutationObserver(scheduleSync).observe(inspector,{childList:true,subtree:true});
  new MutationObserver(scheduleSync).observe($('layerLanes'),{childList:true,subtree:true});
  function syncPro(){
    const fx=selectedEffect(),name=fx?EFFECT_BY_ID[fx.id]?.name||fx.id:'Choose an effect below';
    if($('proActiveName').textContent!==name)$('proActiveName').textContent=name;
    $('proScope').textContent=state.fxScope==='master'?'MASTER ↔':'LAYER ↔';
    $('proStrength').disabled=!fx;$('proStrengthNumber').disabled=!fx;$('proBypass').disabled=!fx;
    if(fx){if(document.activeElement!==$('proStrength'))$('proStrength').value=fx.amount;if(document.activeElement!==$('proStrengthNumber'))$('proStrengthNumber').value=String(Math.round(fx.amount*100));$('proBypass').setAttribute('aria-pressed',String(fx.enabled===false));$('proBypass').textContent=fx.enabled===false?'Bypassed':'Bypass';}
    quick.querySelectorAll('[data-core-fx]').forEach(b=>{b.setAttribute('aria-pressed',String(fx?.id===b.dataset.coreFx));b.classList.toggle('in-chain',activeChain().some(f=>f.id===b.dataset.coreFx));});
    if(state.layers.every(l=>l.type==='demo')){for(const l of state.layers)if(l.name==='Moon + stardust')l.name='Guardian reference';$('activeLayerName').textContent='Guardian reference';}
  }
  // The preview is fitted into its allocated area. Portrait media never pushes core effects off-screen.
  function fitPreview(){const shell=$('stageShell'),unit=shell.querySelector('.monitor-unit'),screen=shell.querySelector('.stage-background');if(!unit||!screen)return;const css=getComputedStyle(shell),u=getComputedStyle(unit),n=v=>parseFloat(v)||0,rail=unit.querySelector('.monitor-rail');const w=Math.max(50,shell.clientWidth-n(css.paddingLeft)-n(css.paddingRight)-n(u.paddingLeft)-n(u.paddingRight)-n(u.borderLeftWidth)-n(u.borderRightWidth)),h=Math.max(35,shell.clientHeight-n(css.paddingTop)-n(css.paddingBottom)-n(u.paddingTop)-n(u.paddingBottom)-n(u.borderTopWidth)-n(u.borderBottomWidth)-(rail?.getBoundingClientRect().height||0)),ratio=stage.width/stage.height;screen.style.width=`${Math.min(w,h*ratio)}px`;screen.style.height=`${Math.min(h,w/ratio)}px`;screen.style.maxWidth='100%';}
  new ResizeObserver(fitPreview).observe($('stageShell'));
  new MutationObserver(fitPreview).observe(stage,{attributes:true,attributeFilter:['width','height']});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('pro-tools-open');toolsButton.setAttribute('aria-expanded','false');}});
  document.addEventListener('click',e=>{if(!mobile.matches&&document.body.classList.contains('pro-tools-open')&&!tools.contains(e.target)&&e.target!==toolsButton)document.body.classList.remove('pro-tools-open');});
  syncPro();numericControls();fitPreview();
  window.__BSEG_UI__={version:'008',setPanel,sync:syncPro,fitPreview,getPanel:()=>panel};
}
mountProConsole();
