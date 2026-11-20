import {readFileSync,writeFileSync} from 'node:fs';
let h=readFileSync('public/index.html','utf8');
const start='/* BSEG_SESSION_START */',end='/* BSEG_SESSION_END */';
if(h.includes(start)){const a=h.indexOf(start),b=h.indexOf(end,a);if(b<0)throw Error('Unclosed session module');h=h.slice(0,a)+h.slice(b+end.length);}
function replace(a,b){if(h.includes(b))return;if(h.split(a).length!==2)throw Error('Session anchor missing: '+a.slice(0,70));h=h.replace(a,()=>b);}
const oldRestore="function restore(){try{const saved=JSON.parse(localStorage.getItem('bseg-moon-relic-project')||'null');if(saved&&Array.isArray(saved.layers)&&Array.isArray(saved.effects))return normalizeState(saved);}catch{}return starter();}";
replace(oldRestore,`let BSEG_SESSION_EPOCH=0;
function restore(){const fresh=starter();try{const recipes=JSON.parse(localStorage.getItem('bseg-saved-recipes')||'null');const previous=JSON.parse(localStorage.getItem('bseg-moon-relic-project')||'null');fresh.customRecipes=Array.isArray(recipes)?recipes:Array.isArray(previous?.customRecipes)?previous.customRecipes:[];}catch{}return fresh;}`);
replace('async function attachMedia(layer,blob,persist=true){','async function attachMedia(layer,blob,persist=true){\n const attachEpoch=BSEG_SESSION_EPOCH;');
replace('const old=media.get(layer.id);if(old)',"if(attachEpoch!==BSEG_SESSION_EPOCH)throw Error('Import cancelled by session change');\n  const old=media.get(layer.id);if(old)");
replace('async function importFiles(fileList){','async function importFiles(fileList){\n const importEpoch=BSEG_SESSION_EPOCH;');
replace('try{await attachMedia(layer,file);state.layers.forEach',"try{await attachMedia(layer,file);if(importEpoch!==BSEG_SESSION_EPOCH){releaseSessionMedia(layer.id);return;}state.layers.forEach");
replace('}catch(e){console.warn(e);if(status){status.textContent=`Could not import',"}catch(e){if(importEpoch!==BSEG_SESSION_EPOCH)return;console.warn(e);if(status){status.textContent=`Could not import");
const moduleStart=h.indexOf('<script type="module">'),p=h.indexOf('</script>',moduleStart);if(moduleStart<0||p<0)throw Error('Engine module not found');h=h.slice(0,p)+'\n'+start+'\n'+readFileSync('public/session-controls.js','utf8')+'\n'+end+'\n'+h.slice(p);
for(const m of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new Function(m[1]);
writeFileSync('public/index.html',h);console.log('Fresh startup and reversible session controls installed.');
