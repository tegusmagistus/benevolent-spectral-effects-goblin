// Copy temporal feedback from our RGBA render target, not an opaque browser backbuffer.
import {readFileSync,writeFileSync} from 'node:fs';
const path='public/index.html';let html=readFileSync(path,'utf8');
const old="gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.textures[4]);try{gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,this.w,this.h);this.historyReady=true;}catch(e){this.historyReady=false;}gl.activeTexture(gl.TEXTURE0);";
const fix="gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.textures[4]);if(pass>0){gl.bindFramebuffer(gl.FRAMEBUFFER,this.framebuffers[(pass-1)%2]);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,this.w,this.h);gl.bindFramebuffer(gl.FRAMEBUFFER,null);this.historyReady=true;}else{this.historyReady=false;}gl.activeTexture(gl.TEXTURE0); // BSEG008 RGBA history";
if(html.includes(old))html=html.replace(old,fix);else if(!html.includes('BSEG008 RGBA history'))throw Error('Feedback renderer anchor changed');
writeFileSync(path,html);console.log('Verified RGBA target used for temporal history.');
