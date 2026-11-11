// Keep exploration comfortable: open sections and scroll position survive parameter edits.
(()=>{
 const old=renderInspector;
 renderInspector=function(){const root=$('effectInspector'),scroll=$('fxPanel').scrollTop;const open=[...root.querySelectorAll('.depth-section')].map(d=>d.open);old();root.querySelectorAll('.depth-section').forEach((d,i)=>{d.open=!!open[i];});$('fxPanel').scrollTop=scroll;};
 const compare=$('depthCompare');
 for(const event of ['keydown','keyup'])compare.addEventListener(event,e=>{if(e.code==='Space'||e.code==='Enter')e.stopPropagation();},true);
 for(const id of ['recordVideo','exportPng'])$(id).addEventListener('click',()=>window.__BSEG_DEPTH__.compare(false),true);
 for(const recipe of RECIPES.filter(p=>p.id.startsWith('d12-')))for(const fx of recipe.effects){const def=D12[fx.id];if(def?.colors){fx.deepColor0=def.looks[fx.deepLook||0][2];fx.deepColor1=def.looks[fx.deepLook||0][3];}}
 $('effectInspector').addEventListener('click',e=>{if(e.target.closest('[data-depth-reset]')){const f=selectedEffect();if(D12[f?.id]?.colors){f.deepColor0=D12[f.id].looks[0][2];f.deepColor1=D12[f.id].looks[0][3];}}},true);
 const name=$('proActiveName');name.tabIndex=0;name.setAttribute('role','button');name.setAttribute('title','Open selected effect controls');
 function focus(){window.__BSEG_UI__.setPanel('tune');const panel=$('fxPanel'),card=panel.querySelector('.depth-card')||$('effectInspector');if(card)panel.scrollTop+=card.getBoundingClientRect().top-panel.getBoundingClientRect().top-8;}
 name.addEventListener('click',focus);name.addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();focus();}});
 window.__BSEG_DEPTH__.focus=focus;
 refresh();
})();
