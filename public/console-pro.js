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
  // Keep category browsing available without consuming the phone's effect list.
  const searchRow=make('div',{class:'mobile-effect-search'});
  const search=$('searchEffect'),categories=$('categoryBar');
  const filterToggle=make('button',{type:'button',class:'mobile-effect-filters','aria-controls':'categoryBar','aria-expanded':'false'},'Filters ▾');
  search.before(searchRow);searchRow.append(search,filterToggle);
  library.classList.add('mobile-filters-closed');
  function showFilters(open){
    library.classList.toggle('mobile-filters-closed',!open);
    filterToggle.setAttribute('aria-expanded',String(open));
  }
  function syncFilterLabel(){
    const selected=categories.querySelector('.active')?.textContent?.trim()||'All';
    filterToggle.textContent=(selected==='All'?'Filters':selected)+' ▾';
    filterToggle.setAttribute('aria-label','Effect categories, current filter: '+selected);
  }
  filterToggle.onclick=()=>showFilters(filterToggle.getAttribute('aria-expanded')!=='true');
  categories.addEventListener('click',e=>{
    if(!e.target.closest('button'))return;
    if(mobile.matches){showFilters(false);filterToggle.focus({preventScroll:true});}
    syncFilterLabel();
  });
  searchRow.addEventListener('keydown',e=>{if(e.key==='Escape'){showFilters(false);filterToggle.focus();}});
  categories.addEventListener('keydown',e=>{if(e.key==='Escape'){showFilters(false);filterToggle.focus();}});
  new MutationObserver(syncFilterLabel).observe(categories,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  syncFilterLabel();

  const help=make('div',{class:'pro-capability-note',role:'status'},'WebGL2 is unavailable in this browser. The Tibetan-inspired processors still work; other processors need WebGL2.');
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
  const shell = $('stageShell');
  const unit = shell.querySelector('.monitor-unit');
  const screen = shell.querySelector('.stage-background');
  const slot = document.createElement('div');
  slot.className = 'preview-slot';
  shell.before(slot);
  slot.append(shell);
  const viewport = document.createElement('div');
  viewport.className = 'preview-viewport';
  viewport.tabIndex = 0;
  viewport.setAttribute('aria-label', 'Preview viewport. Scroll to pan when zoomed in.');
  screen.before(viewport);
  viewport.append(screen);

  const toolbar = document.createElement('div');
  toolbar.className = 'preview-toolbar';
  toolbar.innerHTML = `
    <div class="preview-grip" title="Drag the floating preview"><span aria-hidden="true">⠿</span></div>
    <select aria-label="Preview zoom" title="100% displays one canvas pixel per CSS pixel">
      <option value="fit">Fit</option><option value="0.5">50%</option>
      <option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option>
    </select>
    <button type="button" data-preview="dock" aria-pressed="false">Float</button>
    <button type="button" data-preview="reset" title="Reset preview size and position">Reset</button>
    <button type="button" data-preview="fullscreen" aria-label="Fullscreen preview" aria-pressed="false" title="Fullscreen preview">⤢</button>`;
  unit.before(toolbar);
  const zoom = toolbar.querySelector('select');
  const dock = toolbar.querySelector('[data-preview="dock"]');
  const reset = toolbar.querySelector('[data-preview="reset"]');
  const fullscreen = toolbar.querySelector('[data-preview="fullscreen"]');
  const grip = toolbar.querySelector('.preview-grip');
  const stageTop = center.querySelector('.stage-top');
  grip.append(...stageTop.children);
  stageTop.remove();
  let floating = false;
  let floatRect;
  let dockRect;
  let gesture;

  function fitPreview() {
    const scale = zoom.value === 'fit'
      ? Math.min((viewport.clientWidth - 2) / stage.width, (viewport.clientHeight - 2) / stage.height)
      : Number(zoom.value);
    const width = Math.max(1, stage.width * scale);
    const height = Math.max(1, stage.height * scale);
    screen.style.width = width + 2 + 'px';
    screen.style.height = height + 2 + 'px';
    viewport.classList.toggle('preview-fit', zoom.value === 'fit');
  }

  function previewBounds() {
    const visible = window.visualViewport;
    const left = (visible?.offsetLeft ?? 0) + 8;
    const top = (visible?.offsetTop ?? 0) + 8;
    return {left, top, right: left + Math.min(innerWidth, visible?.width ?? innerWidth) - 16,
      bottom: top + Math.min(innerHeight, visible?.height ?? innerHeight) - 16};
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function placeFloating(rect) {
    const bounds = previewBounds();
    const maxWidth = bounds.right - bounds.left;
    const maxHeight = bounds.bottom - bounds.top;
    const width = clamp(rect.width, Math.min(250, maxWidth), maxWidth);
    const height = clamp(rect.height, Math.min(145, maxHeight), maxHeight);
    floatRect = {width, height,
      left: clamp(rect.left, bounds.left, bounds.right - width),
      top: clamp(rect.top, bounds.top, bounds.bottom - height)};
    for (const [property, value] of Object.entries(floatRect)) shell.style[property] = value + 'px';
  }

  function defaultFloatRect() {
    const rect = slot.getBoundingClientRect();
    const bounds = previewBounds();
    const width = Math.min(rect.width, (bounds.right - bounds.left) * .84);
    const height = Math.min(rect.height, (bounds.bottom - bounds.top) * .49);
    return {left: rect.left + (rect.width - width) / 2, top: rect.top, width, height};
  }

  function sizeDocked() {
    const width = dockRect && Math.min(dockRect.width, slot.clientWidth);
    const height = dockRect && Math.min(dockRect.height, slot.clientHeight);
    shell.style.left = dockRect ? Math.min(dockRect.left, slot.clientWidth - width) + 'px' : '';
    shell.style.top = dockRect ? Math.min(dockRect.top, slot.clientHeight - height) + 'px' : '';
    shell.style.width = dockRect ? width + 'px' : '';
    shell.style.height = dockRect ? height + 'px' : '';
  }

  dock.addEventListener('click', () => {
    floating = !floating;
    shell.classList.toggle('preview-floating', floating);
    slot.classList.toggle('preview-slot-empty', floating);
    dock.textContent = floating ? 'Dock' : 'Float';
    dock.setAttribute('aria-pressed', String(floating));
    if (floating) {
      document.body.append(shell);
      placeFloating(floatRect ?? defaultFloatRect());
    } else {
      slot.append(shell);
      sizeDocked();
    }
    dock.focus({preventScroll: true});
  });

  reset.addEventListener('click', () => {
    if (floating) placeFloating(defaultFloatRect());
    else {
      dockRect = undefined;
      sizeDocked();
    }
  });

  function updateFullscreen() {
    const active = document.fullscreenElement === shell || shell.classList.contains('preview-expanded');
    dock.disabled = active;
    reset.disabled = active;
    fullscreen.setAttribute('aria-pressed', String(active));
    fullscreen.setAttribute('aria-label', active ? 'Exit fullscreen preview' : 'Fullscreen preview');
    if (!active) keepPreviewVisible();
  }

  async function togglePreviewFullscreen() {
    if (document.fullscreenElement === shell) await document.exitFullscreen();
    else if (shell.classList.contains('preview-expanded')) shell.classList.remove('preview-expanded');
    else {
      try {
        if (!shell.requestFullscreen) throw Error('Fullscreen API unavailable');
        await shell.requestFullscreen();
      } catch {
        shell.classList.add('preview-expanded');
      }
    }
    updateFullscreen();
  }

  fullscreen.addEventListener('click', togglePreviewFullscreen);
  $('fullscreenStage').onclick = togglePreviewFullscreen;
  document.addEventListener('fullscreenchange', updateFullscreen);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && shell.classList.contains('preview-expanded')) {
      shell.classList.remove('preview-expanded');
      updateFullscreen();
      fullscreen.focus();
    }
  });

  function startGesture(event, direction) {
    if (gesture || event.button !== 0 || (!floating && direction === 'move') ||
        fullscreen.getAttribute('aria-pressed') === 'true') return;
    const rect = shell.getBoundingClientRect();
    const bounds = floating ? previewBounds() : slot.getBoundingClientRect();
    gesture = {direction, bounds, rect, x: event.clientX, y: event.clientY, pointer: event.pointerId};
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointer) return;
    const {direction, bounds, rect, x, y} = gesture;
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    if (direction === 'move') {
      placeFloating({left: rect.left + dx, top: rect.top + dy, width: rect.width, height: rect.height});
      return;
    }
    const minWidth = Math.min(250, bounds.right - bounds.left);
    const minHeight = Math.min(145, bounds.bottom - bounds.top);
    const left = direction.includes('w') ? clamp(rect.left + dx, bounds.left, rect.right - minWidth) : rect.left;
    const right = direction.includes('e') ? clamp(rect.right + dx, rect.left + minWidth, bounds.right) : rect.right;
    const top = direction.includes('n') ? clamp(rect.top + dy, bounds.top, rect.bottom - minHeight) : rect.top;
    const bottom = direction.includes('s') ? clamp(rect.bottom + dy, rect.top + minHeight, bounds.bottom) : rect.bottom;
    const width = right - left;
    const height = bottom - top;
    if (floating) placeFloating({left, top, width, height});
    else {
      dockRect = {left: left - bounds.left, top: top - bounds.top, width, height};
      sizeDocked();
    }
  }

  grip.addEventListener('pointerdown', event => startGesture(event, 'move'));
  for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    const handle = document.createElement('span');
    handle.className = 'preview-resize';
    handle.dataset.edge = direction;
    handle.setAttribute('aria-hidden', 'true');
    handle.addEventListener('pointerdown', event => startGesture(event, direction));
    shell.append(handle);
  }
  shell.addEventListener('pointermove', moveGesture);
  shell.addEventListener('lostpointercapture', event => {
    if (gesture?.pointer === event.pointerId) gesture = undefined;
  });

  zoom.addEventListener('change', () => {
    fitPreview();
    viewport.scrollTo((viewport.scrollWidth - viewport.clientWidth) / 2,
      (viewport.scrollHeight - viewport.clientHeight) / 2);
  });
  new ResizeObserver(fitPreview).observe(viewport);
  new ResizeObserver(() => { if (!floating) sizeDocked(); }).observe(slot);
  new MutationObserver(fitPreview).observe(stage, {attributes: true, attributeFilter: ['width', 'height']});
  function keepPreviewVisible() {
    if (floating) placeFloating(floatRect);
  }
  window.addEventListener('resize', keepPreviewVisible);
  window.visualViewport?.addEventListener('resize', keepPreviewVisible);
  window.visualViewport?.addEventListener('scroll', keepPreviewVisible);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('pro-tools-open');toolsButton.setAttribute('aria-expanded','false');}});
  document.addEventListener('click',e=>{if(!mobile.matches&&document.body.classList.contains('pro-tools-open')&&!tools.contains(e.target)&&e.target!==toolsButton)document.body.classList.remove('pro-tools-open');});
  syncPro();numericControls();fitPreview();
  window.__BSEG_UI__={version:'008',setPanel,sync:syncPro,fitPreview,getPanel:()=>panel};
}
mountProConsole();
