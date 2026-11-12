/* Original perspective descent processor. No inferred depth or tracking data. */
RITUAL_DEFS.vertigoflow = {
 name:'OH GOD JEFF / GO WITH THE FLOW', icon:'↧',
 subtitle:'A vertigo drop into receding video walls, with flowing descent and gentle camera sway',
 hint:'A simulated perspective drop made from your footage. Speed 0 freezes the movement; reduce Sway for a steadier view. Strength blends with the original. No depth map or subject tracking is used.',
 controls:[['height','Height / depth',0,1,.01,.72],['fall','Downward pull',0,1,.01,.48],['sway','Vertigo sway',0,1,.01,.22],['speed','Flow speed',0,2,.01,.35],['tilt','Camera tilt',-30,30,.1,0],['repeat','Depth repetitions',1,6,1,3]]
};
function vertigoFlowGeometry(time,p){
 const clock=(Number.isFinite(time)?time:0)*p.speed;
 const phase=((clock*p.fall*.22)%1+1)%1;
 const scale=.42*Math.exp(-2.2*p.height);
 const stops=[0,1];
 for(let i=1;i<24;i++)stops.push(i/24);
 // Split texture wraps so a seam never stretches the entire source frame.
 for(let i=1;i<=p.repeat+1;i++){const d=(i-phase)/p.repeat;if(d>0&&d<1)stops.push(d);}
 stops.sort((a,b)=>a-b);
 return {clock,phase,scale,stops:stops.filter((d,i)=>!i||d-stops[i-1]>1e-8),
  x:.5+Math.sin(clock*.73)*p.sway*.035,
  y:.46+p.fall*.12+Math.sin(clock*.53)*p.sway*.025,
  angle:(p.tilt+Math.sin(clock*.9)*p.sway*7)*Math.PI/180};
}
function vertigoFlowTriangle(c,source,uv,xy){
 const [a,b,d]=uv,[p,q,r]=xy;
 const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-a[0],vy=d[1]-a[1],det=ux*vy-uy*vx;
 if(Math.abs(det)<1e-7)return;
 const A=((q[0]-p[0])*vy-(r[0]-p[0])*uy)/det;
 const B=((q[1]-p[1])*vy-(r[1]-p[1])*uy)/det;
 const C=((r[0]-p[0])*ux-(q[0]-p[0])*vx)/det;
 const D=((r[1]-p[1])*ux-(q[1]-p[1])*vx)/det;
 c.save();c.beginPath();c.moveTo(...p);c.lineTo(...q);c.lineTo(...r);c.closePath();c.clip();
 c.transform(A,B,C,D,p[0]-A*a[0]-C*a[1],p[1]-B*a[0]-D*a[1]);c.drawImage(source,0,0);c.restore();
}
function drawVertigoFlow(c,source,w,h,time,p){
 const g=vertigoFlowGeometry(time,p),corners=[[-.85*w,-.85*h],[.85*w,-.85*h],[.85*w,.85*h],[-.85*w,.85*h]];
 const ring=(i,d)=>{const s=Math.pow(g.scale,d);return [corners[i][0]*s,corners[i][1]*s];};
 c.save();c.translate(g.x*w,g.y*h);c.rotate(g.angle);c.imageSmoothingEnabled=true;
 // Distant floor and four receding walls share a stable vanishing point.
 c.drawImage(source,-.85*w*g.scale,-.85*h*g.scale,1.7*w*g.scale,1.7*h*g.scale);
 for(let side=0;side<4;side++){
  const next=(side+1)%4;
  for(let n=0;n<g.stops.length-1;n++){
   const a=g.stops[n],b=g.stops[n+1],tile=Math.floor((a+b)*.5*p.repeat+g.phase);
   const v0=Math.max(0,Math.min(1,a*p.repeat+g.phase-tile))*h;
   const v1=Math.max(0,Math.min(1,b*p.repeat+g.phase-tile))*h;
   const q=[ring(side,a),ring(next,a),ring(next,b),ring(side,b)];
   vertigoFlowTriangle(c,source,[[0,v0],[w,v0],[w,v1]],[q[0],q[1],q[2]]);
   vertigoFlowTriangle(c,source,[[0,v0],[w,v1],[0,v1]],[q[0],q[2],q[3]]);
   c.save();c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(4,6,17,${p.height*(.08+(a+b)*.22)+(side%2)*.045})`;
   c.beginPath();c.moveTo(...q[0]);for(let i=1;i<4;i++)c.lineTo(...q[i]);c.closePath();c.fill();c.restore();
  }
 }
 c.restore();
}
