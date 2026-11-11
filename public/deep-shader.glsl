// BSEG 012 dedicated effect branches. Values are independent, not generic contrast macros.
if(u_deep>0){
 vec2 px=1.0/u_res;
 vec3 c=source.rgb,result=c;
 float referenceScale=u_res.y/720.0;
 vec2 center=vec2(.5);
 if(u_deep==1){
  vec3 light=vec3(0.);float weights=0.;
  for(int i=0;i<16;i++){
   float angle=float(i)*2.399963;float r=sqrt((float(i)+.5)/16.);
   vec3 s=texture(u_tex,clamp(uv+vec2(cos(angle),sin(angle))*r*u_d[0]*referenceScale*px,0.,1.)).rgb;
   float gate=smoothstep(u_d[1]-u_d[2],u_d[1]+u_d[2],luma(s));float weight=1.-r*.5;
   light+=s*gate*weight;weights+=weight;
  }
  vec3 tint=vec3(1.+u_d[4]*.2,1.,1.-u_d[4]*.2);
  result=c+light/max(weights,.001)*u_d[3]*tint;
 }else if(u_deep==2){
  vec2 p=uv-vec2(u_d[3],u_d[4]);
  float a=radians(u_d[1]);vec2 linear=vec2(cos(a),sin(a));
  vec2 offset=mix(linear,p*2.,u_d[2])*u_d[0]*referenceScale*px;
  result=vec3(texture(u_tex,clamp(uv+offset,0.,1.)).r,c.g,texture(u_tex,clamp(uv-offset,0.,1.)).b);
 }else if(u_deep==3){
  float a=radians(u_d[3]);vec2 dir=vec2(cos(a),sin(a)),perp=vec2(-dir.y,dir.x);
  float phase=u_time*u_d[2]*6.283185;
  vec2 offset=dir*sin(dot(uv,perp)*u_d[1]*6.283185-phase)+perp*cos(dot(uv,dir)*u_d[1]*4.44288+phase)*u_d[4];
  result=texture(u_tex,clamp(uv+offset*u_d[0]*referenceScale*px,0.,1.)).rgb;
 }else if(u_deep==4){
  vec2 p=uv-.5;p.x*=u_res.x/u_res.y;
  float radius=length(p)*u_d[2],sector=6.283185/max(2.,u_d[0]);
  float angle=atan(p.y,p.x)+radians(u_d[1]+u_time*u_d[5]);
  angle=abs(mod(angle+sector*.5,sector)-sector*.5);
  vec2 q=radius*vec2(cos(angle),sin(angle));q.x/=u_res.x/u_res.y;
  result=texture(u_tex,clamp(q+vec2(u_d[3],u_d[4]),0.,1.)).rgb;
 }else if(u_deep==5){
  float depth=u_hasDepth==1?texture(u_depthTex,uv).r:luma(c);
  vec2 orbit=vec2(u_d[2],u_d[3])+vec2(sin(u_time*u_d[5]*6.283185),cos(u_time*u_d[5]*6.283185))*u_d[4];
  result=texture(u_tex,clamp(uv+(depth-u_d[1])*orbit*u_d[0]*referenceScale*px,0.,1.)).rgb;
 }else if(u_deep==6||u_deep==7||u_deep==8){
  vec2 q=uv;float life=u_d[0],retention=exp(-.693147*u_dt/max(.03,life));
  if(u_deep==6){float a=radians(u_d[4]);vec2 p=(uv-.5)/max(.1,u_d[3]);q=.5+mat2(cos(a),-sin(a),sin(a),cos(a))*p-vec2(u_d[1],u_d[2])*referenceScale*px;}
  if(u_deep==7)q=uv-vec2(u_d[2],u_d[3])*referenceScale*px;
  if(u_deep==8){float a=radians(u_d[2]);vec2 p=(uv-.5)/max(.1,u_d[1]);q=.5+mat2(cos(a),-sin(a),sin(a),cos(a))*p-vec2(u_d[3],u_d[4])*referenceScale*px;}
  vec3 prior=texture(u_history,clamp(q,0.,1.)).rgb;
  if(u_deep==8){float a=radians(u_d[5]);vec3 axis=normalize(vec3(1.));prior=prior*cos(a)+cross(axis,prior)*sin(a)+axis*dot(axis,prior)*(1.-cos(a));}
  if(u_deep==7){float gate=smoothstep(u_d[1],min(1.,u_d[1]+.1),luma(c));result=max(c,prior*retention);result=max(result,c*gate*u_d[4]);}
  else result=mix(c,prior,retention);
  if(u_hasHistory==0)result=c;
 }else if(u_deep==9){
  vec3 streak=vec3(0.);float weights=0.;float a=radians(u_d[2]);vec2 dir=vec2(cos(a),sin(a)),perp=vec2(-dir.y,dir.x);
  for(int i=-8;i<=8;i++){
   float f=float(i)/8.,w=exp(-abs(f)*u_d[5]);vec2 q=clamp(uv+dir*f*u_d[1]*referenceScale*px,0.,1.);
   vec2 split=perp*u_d[4]*referenceScale*px;
   vec3 s=vec3(texture(u_tex,clamp(q+split,0.,1.)).r,texture(u_tex,q).g,texture(u_tex,clamp(q-split,0.,1.)).b);
   streak+=s*smoothstep(u_d[0],min(1.,u_d[0]+.12),luma(s))*w;weights+=w;
  }
  result=c+streak/max(weights,.001)*u_d[3];
 }else if(u_deep==10){
  float a=radians(u_d[3]);mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));
  vec2 grid=rot*(uv*u_res)/(max(8.,u_d[0])*referenceScale)+vec2(u_time*u_d[4]);
  vec2 normal=fract(grid)-.5;normal=transpose(rot)*normal;
  vec2 offset=normal*u_d[1]*referenceScale*px;
  vec2 split=normal*u_d[2]*referenceScale*px;
  result=vec3(texture(u_tex,clamp(uv+offset+split,0.,1.)).r,texture(u_tex,clamp(uv+offset,0.,1.)).g,texture(u_tex,clamp(uv+offset-split,0.,1.)).b);
 }else if(u_deep==11){
  float value=(luma(c)-.5)*u_d[0]+.5+u_d[3];
  float tone=smoothstep(u_d[1]-u_d[2]*.5,u_d[1]+u_d[2]*.5,value);
  result=mix(u_dcol0,u_dcol1,tone);
 }
 result=clamp(result,0.,1.);
 if(u_dblend==1)result=1.-(1.-c)*(1.-result);
 else if(u_dblend==2)result=min(vec3(1.),c+result);
 else if(u_dblend==3)result=c*result;
 else if(u_dblend==4)result=abs(c-result);
 float mask=1.;if(u_dmask.x>0.){mask=smoothstep(u_dmask.y-max(.001,u_dmask.z),u_dmask.y+max(.001,u_dmask.z),luma(c));if(u_dmask.x>1.5)mask=1.-mask;}
 outColor=vec4(mix(c,result,amount*mask),source.a);return;
}
