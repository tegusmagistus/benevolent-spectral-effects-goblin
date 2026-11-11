// Temporal caches belong to a processor and a scope, never the entire mixed stack.
// Bounded history is 640px on its long edge; the current rendered frame retains output resolution.
function d12Free(owner){if(!owner.deepMemory)return;const gl=owner.gl;for(const e of owner.deepMemory.values()){e.tex.forEach(t=>gl.deleteTexture(t));e.fb.forEach(f=>gl.deleteFramebuffer(f));}owner.deepMemory.clear();}
function d12History(owner,key,time){
 const gl=owner.gl;owner.deepMemory??=new Map();let e=owner.deepMemory.get(key);
 if(!e){
  if(owner.deepMemory.size>=8){const first=[...owner.deepMemory.entries()].sort((a,b)=>a[1].used-b[1].used)[0];first[1].tex.forEach(t=>gl.deleteTexture(t));first[1].fb.forEach(f=>gl.deleteFramebuffer(f));owner.deepMemory.delete(first[0]);}
  const scale=Math.min(1,640/Math.max(owner.w,owner.h)),w=Math.max(2,Math.round(owner.w*scale)),h=Math.max(2,Math.round(owner.h*scale));
  const tex=[makeTexture(gl,w,h),makeTexture(gl,w,h)],fb=tex.map(t=>{const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Temporal framebuffer unavailable');return f;});
  e={w,h,tex,fb,read:0,ready:false,pending:false,time:null,epoch:D12_EPOCH,dt:1/30};owner.deepMemory.set(key,e);
 }
 e.used=performance.now();
 if(e.epoch!==D12_EPOCH||e.time!==null&&(time<e.time-.0001||time-e.time>.5)){e.ready=false;e.pending=false;e.time=null;e.epoch=D12_EPOCH;}
 if(e.time===null)e.time=time;
 else if(time>e.time+.0001){e.dt=d12Clamp(time-e.time,1/240,.5);if(e.pending){e.read=1-e.read;e.ready=true;}e.time=time;e.pending=false;}
 return e;
}
function d12Uniforms(owner,fx,options,time){
 const gl=owner.gl,u=owner.uniforms,spec=fx.d12===1&&D12[fx.id];
 gl.uniform1i(u.u_deep,spec?spec.mode:0);
 if(!spec)return null;
 const values=spec.controls.map(([key,,min,max,,def])=>d12Clamp(Number.isFinite(fx['deep_'+key])?fx['deep_'+key]:def,min,max));while(values.length<8)values.push(0);
 gl.uniform1fv(u['u_d[0]'],values);gl.uniform1i(u.u_dblend,fx.deepBlend||0);gl.uniform4f(u.u_dmask,fx.deepRegion||0,fx.deepThreshold??.5,fx.deepFeather??.15,0);
 const color=hex=>{const h=/^#[0-9a-f]{6}$/i.test(hex||'')?hex:'#ffffff';return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);};
 gl.uniform3fv(u.u_dcol0,color(fx.deepColor0||'#16112f'));gl.uniform3fv(u.u_dcol1,color(fx.deepColor1||'#e5c9fa'));
 let entry=null;if(spec.temporal){entry=d12History(owner,`${options.scopeKey||'master'}:${fx.d12Token||fx.id}`,time);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,entry.tex[entry.read]);gl.uniform1i(u.u_hasHistory,entry.ready?1:0);gl.uniform1f(u.u_dt,entry.dt);gl.activeTexture(gl.TEXTURE0);}return entry;
}
function d12Remember(owner,e,output){
 if(!e)return;const gl=owner.gl,u=owner.uniforms;
 gl.bindFramebuffer(gl.FRAMEBUFFER,e.fb[1-e.read]);gl.viewport(0,0,e.w,e.h);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,output);
 gl.uniform1i(u.u_deep,0);gl.uniform1i(u.u_mode,0);gl.uniform1f(u.u_amount,1);gl.uniform4f(u.u_custom,.5,.5,.5,.5);gl.drawArrays(gl.TRIANGLES,0,6);
 e.pending=true;gl.viewport(0,0,owner.w,owner.h);
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,owner.textures[4]);gl.uniform1i(u.u_hasHistory,owner.historyReady?1:0);gl.activeTexture(gl.TEXTURE0);
}
