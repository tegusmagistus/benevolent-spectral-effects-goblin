import {readFileSync,writeFileSync} from 'node:fs';
const file='public/index.html';let h=readFileSync(file,'utf8');
const start='/* ANALOGUE_SIGNALS_START */',end='/* ANALOGUE_SIGNALS_END */';
if(h.includes(start)){const a=h.indexOf(start),b=h.indexOf(end,a);if(b<0)throw Error('Unclosed analogue module');h=h.slice(0,a)+h.slice(b+end.length);}
function patch(a,b){if(h.includes(b))return;if(h.split(a).length!==2)throw Error('Analogue anchor missing or duplicated: '+a.slice(0,90));h=h.replace(a,()=>b);}
patch('function ritualSettings(',start+'\n'+readFileSync('public/analogue-signals.js','utf8')+'\n'+end+'\nfunction ritualSettings(');
patch("category:'Tibetan-inspired',desc:d.subtitle","category:d.category||'Tibetan-inspired',desc:d.subtitle");
patch("const CATEGORIES = ['All',","const CATEGORIES = ['All','Analogue',");
patch('`${e.name} ${e.desc}`.toLowerCase()',"`${e.name} ${e.desc} ${e.category==='Analogue'?'analog analoge analogue crt phosphor oscilloscope':''}`.toLowerCase()");
patch('TIBETAN-INSPIRED / MINI SETTINGS','${def.category===\'Analogue\'?\'ANALOGUE / SIGNAL SETTINGS\':\'TIBETAN-INSPIRED / MINI SETTINGS\'}');
patch('<div class="ritual-mini"><div class="ritual-caption">','<div class="ritual-mini">${def.category===\'Analogue\'?\'<button class="btn ghost fill" type="button" data-analogue-crisp>Crisp detail</button><p class="hint">Sharper lines and clearer features. Quality: 1 Draft · 2 Fine · 3 Ultra.</p>\':\'\'}<div class="ritual-caption">');
patch("if(e.target.closest('[data-reset-ritual]'))", "if(e.target.closest('[data-analogue-crisp]')){const fx=selectedEffect();if(fx&&ANALOGUE_IDS.includes(fx.id)){snapshot();Object.assign(fx,analogueCrispSettings(fx));refresh();store();notify('Crisp detail applied. Adjust quality, clarity and line density below.');}return;}if(e.target.closest('[data-reset-ritual]'))");
patch("amount:id==='glitch'?.65:.86","amount:ANALOGUE_IDS.includes(id)?1:id==='glitch'?.65:.86");
patch("amount:fx.id==='glitch'?.65:.86","amount:ANALOGUE_IDS.includes(fx.id)?1:fx.id==='glitch'?.65:.86");
const dispatch="if(ANALOGUE_IDS.includes(fx.id)){drawAnalogueSignal(this,c,source,w,h,time,p,fx.id);c.restore();oc.save();oc.globalAlpha=amount;oc.drawImage(this.fx,0,0);oc.restore();return out;}";
patch("if(fx.id==='vertigoflow'){",dispatch+"\n if(fx.id==='vertigoflow'){");
h=h.replaceAll('Canvas mode: Tibetan-inspired effects active; other effects need WebGL2','Canvas mode: Analogue + Tibetan-inspired effects active').replaceAll('Canvas mode: the Tibetan-inspired effects work.','Canvas mode: Analogue and Tibetan-inspired effects work.');
for(const m of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new Function(m[1]);
writeFileSync(file,h);console.log('Analogue signal processors installed, including rose dust, neon veil and coral interference.');
