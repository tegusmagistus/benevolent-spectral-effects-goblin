import {readFileSync,writeFileSync} from 'node:fs';
const file='public/index.html';let h=readFileSync(file,'utf8');
const start='/* VERTIGO_FLOW_START */',end='/* VERTIGO_FLOW_END */';
if(h.includes(start)){const a=h.indexOf(start),b=h.indexOf(end,a);if(b<0)throw Error('Unclosed vertigo processor');h=h.slice(0,a)+h.slice(b+end.length);}
function once(a,b){if(h.split(a).length!==2)throw Error('Vertigo build anchor missing or duplicated: '+a.slice(0,75));h=h.replace(a,()=>b);}
once('function ritualSettings(',start+'\n'+readFileSync('public/vertigo-flow.js','utf8')+'\n'+end+'\nfunction ritualSettings(');
const dispatch="if(fx.id==='vertigoflow'){drawVertigoFlow(c,source,w,h,time,p);c.restore();oc.save();oc.globalAlpha=amount;oc.drawImage(this.fx,0,0);oc.restore();return out;}";
if(!h.includes(dispatch))once("if(fx.id==='mahakala')this.mahakala",dispatch+"\n if(fx.id==='mahakala')this.mahakala");
// Reuse the existing typed sliders, numeric inputs, reset and project persistence.
if(!h.includes('${def.hint||')){
 const old="${fx.id==='mahakala'?'Dedicated to Jeff. ':''}Original artwork-inspired processing, not an authentic ritual depiction. Echo uses earlier frames while playing; it resets on seeking.";
 const replacement="${def.hint||((fx.id==='mahakala'?'Dedicated to Jeff. ':'')+'Original artwork-inspired processing, not an authentic ritual depiction. Echo uses earlier frames while playing; it resets on seeking.')}";
 once(old,replacement);
}
h=h.replaceAll('the five Tibetan-inspired effects','the Tibetan-inspired effects').replaceAll('The five Tibetan-inspired processors','The Tibetan-inspired processors');
for(const m of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new Function(m[1]);
writeFileSync(file,h);console.log('Vertigo Flow added to the existing Tibetan-inspired processors.');
