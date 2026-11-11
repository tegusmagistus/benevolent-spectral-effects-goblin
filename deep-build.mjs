/** BSEG 012 additive build transform. Fail closed when source anchors change. */
import {readFileSync,writeFileSync} from 'node:fs';
const file='public/index.html';let h=readFileSync(file,'utf8');
const read=n=>readFileSync('public/'+n,'utf8');
function once(a,b,name){const n=h.split(a).length-1;if(n!==1)throw Error(`Depth Lab ${name}: expected one anchor, found ${n}`);h=h.replace(a,()=>b);}
const start='/* D12_CONTROLS_START */',end='/* D12_CONTROLS_END */';
if(h.includes(start)){const a=h.indexOf(start),b=h.indexOf(end,a);if(b<0)throw Error('Unclosed depth controls');h=h.slice(0,a)+h.slice(b+end.length);}
if(!h.includes('/* D12_PATCHED_ENGINE */')){
 once('const EFFECTS = [','/* D12_PATCHED_ENGINE */\n'+read('deep-specs.js')+'\n'+read('deep-runtime.js')+'\nconst EFFECTS = [','definitions');
 once('const CATEGORIES = [',"EFFECTS.push(...Object.entries(D12).filter(([,d])=>d.name).map(([id,d])=>({id,name:d.name,category:d.category,desc:d.desc,icon:d.icon,colors:['#151a30','#ceb5e6']})));\nconst CATEGORIES = [",'new processors');
 once('uniform int u_mode;','uniform int u_mode;\nuniform int u_deep;\nuniform float u_d[8];\nuniform float u_dt;\nuniform int u_dblend;\nuniform vec4 u_dmask;\nuniform vec3 u_dcol0;\nuniform vec3 u_dcol1;','shader uniforms');
 once('uv=.5+(uv-.5)*vec2(1.0+(u_custom.z-.5)*.34,1.0-(u_custom.z-.5)*.34);','if(u_deep==0)uv=.5+(uv-.5)*vec2(1.0+(u_custom.z-.5)*.34,1.0-(u_custom.z-.5)*.34);','independent coordinates');
 once('vec4 source=texture(u_tex,uv);vec3 fx=source.rgb;','vec4 source=texture(u_tex,uv);vec3 fx=source.rgb;\n'+read('deep-shader.glsl'),'effect branches');
 once("['u_tex','u_depthTex','u_history'","['u_deep','u_d[0]','u_dt','u_dblend','u_dmask','u_dcol0','u_dcol1','u_tex','u_depthTex','u_history'",'uniform locations');
 once('this.textures?.forEach(t=>gl.deleteTexture(t));','d12Free(this);this.textures?.forEach(t=>gl.deleteTexture(t));','resize cleanup');
 once('for(const fx of active){const output=1+pass%2;','for(const fx of active){const memory=d12Uniforms(this,fx,options,time);const output=1+pass%2;','parameter upload');
 once('gl.drawArrays(gl.TRIANGLES,0,6);input=output;pass++;','gl.drawArrays(gl.TRIANGLES,0,6);d12Remember(this,memory,this.textures[output]);input=output;pass++;','isolated memory');
 once('gl.bindTexture(gl.TEXTURE_2D,this.textures[input]);gl.uniform1i(u.u_mode,0);','gl.bindTexture(gl.TEXTURE_2D,this.textures[input]);gl.uniform1i(u.u_deep,0);gl.uniform1i(u.u_mode,0);','final copy');
}
const moduleStart=h.indexOf('<script type="module">'),moduleEnd=h.indexOf('</script>',moduleStart);if(moduleEnd<0)throw Error('Engine module not found');
h=h.slice(0,moduleEnd)+'\n'+start+'\n'+read('deep-controls.js')+'\n'+read('deep-ergonomics.js')+'\n'+end+'\n'+h.slice(moduleEnd);
for(const m of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new Function(m[1]);
writeFileSync(file,h);console.log('BSEG Depth Lab 012 applied.');
