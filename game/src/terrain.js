import {groundHeight,riverCenter,GATES,DELIVERY,RUNWAY} from './flight.js';

export const hash = (a,b=0) => {const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
export function polygon(ctx,points,fill,stroke) {
  if(points.some(p=>!p))return;
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}
}
export function makeProjection(s,w,h) {
  const camera={x:s.x*.92,y:s.alt+104,z:s.z-240};
  const horizon=h*.30, f=w*.72;
  const project=(x,y,z)=>{const depth=z-camera.z;if(depth<20)return null;return {x:w/2+(x-camera.x)*f/depth,y:horizon+(camera.y-y)*f/depth,k:f/depth,depth};};
  return {project,camera,horizon,f};
}
function distantMountains(c,s,w,h) {
  const sky=c.createLinearGradient(0,0,0,h*.64);sky.addColorStop(0,'#346875');sky.addColorStop(.55,'#91b9b0');sky.addColorStop(1,'#f8dba7');c.fillStyle=sky;c.fillRect(0,0,w,h);
  const sunX=w*.76-s.x*.016,sunY=h*.16;
  const halo=c.createRadialGradient(sunX,sunY,10,sunX,sunY,220);halo.addColorStop(0,'#ffe8ad88');halo.addColorStop(1,'#ffe8ad00');c.fillStyle=halo;c.fillRect(0,0,w,h*.55);
  c.fillStyle='#ffe5ac';c.beginPath();c.arc(sunX,sunY,32,0,Math.PI*2);c.fill();
  for(let layer=0;layer<3;layer++) {
    const points=[{x:0,y:h*.48}];
    for(let i=0;i<=24;i++) {
      const x=i*w/24;
      const y=h*(.22+layer*.045)-Math.sin(i*1.7+layer*2)*h*.06-hash(i+layer*53)*h*.09;
      points.push({x,y});
    }
    points.push({x:w,y:h*.5});polygon(c,points,['#7caaa5','#628f8f','#497b7c'][layer]);
  }
  c.lineWidth=1;c.strokeStyle='#ffffff26';
  for(let i=0;i<9;i++){const x=(i*197+s.z*.015)%(w+300)-150,y=45+(i%3)*34;c.beginPath();c.moveTo(x,y);c.lineTo(x+80,y);c.stroke();}
}
function terrainMesh(c,s,p) {
  const step=160, near=Math.floor((s.z-120)/step)*step;
  for(let zi=31;zi>=0;zi--) {
    const z=near+zi*step;
    for(let xi=-16;xi<16;xi++) {
      const x=xi*step;
      const a=groundHeight(x,z),b=groundHeight(x+step,z),d=groundHeight(x,z+step),e=groundHeight(x+step,z+step);
      const pts=[p(x,a,z),p(x+step,b,z),p(x+step,e,z+step),p(x,d,z+step)];
      const elev=(a+b+d+e)/4;
      let fill;
      const k=hash(xi,Math.floor(z/step));
      if(elev>650)fill=k>.5?'#d9dece':'#a7b7ad';
      else if(elev>270)fill=['#527c70','#608775','#71917b','#577e74'][Math.floor(k*4)];
      else fill=['#527c58','#5c875d','#60895e','#4d7b59','#6a9165'][Math.floor(k*5)];
      polygon(c,pts,fill,fill);
      if(elev>120&&k>.5)polygon(c,[pts[0],pts[2],pts[3]],'#274f4b35');
    }
    const z2=z+step;
    const riverWidth=q=>q>5800?48:78;
    const x1=riverCenter(z),x2=riverCenter(z2),rw1=riverWidth(z),rw2=riverWidth(z2);
    polygon(c,[p(x1-rw1-14,1,z),p(x1+rw1+14,1,z),p(x2+rw2+14,1,z2),p(x2-rw2-14,1,z2)],'#9aa071');
    polygon(c,[p(x1-rw1,2,z),p(x1+rw1,2,z),p(x2+rw2,2,z2),p(x2-rw2,2,z2)],zi%3===0?'#68a8a3':'#4e9393');
    if(zi%2===0)polygon(c,[p(x1-15,2.5,z+30),p(x1+50,2.5,z+30),p(x2+35,2.5,z2),p(x2+25,2.5,z2)],'#accec041');
    const road=q=>riverCenter(q)+210;
    polygon(c,[p(road(z)-7,3,z),p(road(z)+7,3,z),p(road(z2)+7,3,z2),p(road(z2)-7,3,z2)],'#b9a97e');
  }
}
function box(c,p,x,y,z,dx,dy,dz,color) {
  const a=p(x-dx,y,z-dz),b=p(x+dx,y,z-dz),d=p(x-dx,y,z+dz),e=p(x+dx,y,z+dz);
  const A=p(x-dx,y+dy,z-dz),B=p(x+dx,y+dy,z-dz),D=p(x-dx,y+dy,z+dz),E=p(x+dx,y+dy,z+dz);
  polygon(c,[a,b,B,A],color);polygon(c,[b,e,E,B],'#294e48');polygon(c,[A,B,E,D],'#d5bb87');
}
function pine(c,p,x,z,height=40) {
  const y=groundHeight(x,z),b=p(x,y,z),t=p(x,y+height,z);if(!b||!t)return;
  const width=(b.y-t.y)*.38;
  polygon(c,[{x:b.x-width,y:b.y-3*b.k},{x:t.x,y:t.y},{x:b.x+width,y:b.y-3*b.k}],'#234f47');
  polygon(c,[{x:b.x,y:b.y-3*b.k},{x:t.x,y:t.y},{x:b.x+width,y:b.y-3*b.k}],'#376b55');
}
function village(c,p) {
  for(let i=0;i<26;i++) {
    const x=240+(i%5)*52+(i%2)*13,z=4750+Math.floor(i/5)*85,y=groundHeight(x,z);
    box(c,p,x,y,z,15,22+(i%3)*5,22,i%2?'#e0cd9d':'#cbbd92');
    polygon(c,[p(x-19,y+24,z-25),p(x,y+40,z-25),p(x+19,y+24,z-25),p(x+19,y+24,z+25),p(x,y+40,z+25),p(x-19,y+24,z+25)],i%3?'#a96745':'#7d7660');
  }
  // The post office clock tower is the delivery landmark.
  box(c,p,DELIVERY.x+80,0,DELIVERY.z,22,112,22,'#ecd5a6');
  polygon(c,[p(DELIVERY.x+52,112,DELIVERY.z-28),p(DELIVERY.x+80,151,DELIVERY.z),p(DELIVERY.x+108,112,DELIVERY.z-28)],'#a95e3d');
  const clock=p(DELIVERY.x+80,91,DELIVERY.z-23);
  if(clock){c.fillStyle='#23464b';c.beginPath();c.arc(clock.x,clock.y,9*clock.k,0,Math.PI*2);c.fill();c.strokeStyle='#f5dc9d';c.lineWidth=1.5;c.beginPath();c.moveTo(clock.x,clock.y-5*clock.k);c.lineTo(clock.x,clock.y);c.lineTo(clock.x+4*clock.k,clock.y);c.stroke();}
}
function viaduct(c,p) {
  const z=3220;
  for(let x=-550;x<=550;x+=110) {
    box(c,p,x,0,z,12,92,18,'#a9aa8b');
    const a=p(x+12,60,z-19),b=p(x+98,60,z-19),mid=p(x+55,92,z-19);
    if(a&&b&&mid){c.strokeStyle='#b7b69a';c.lineWidth=13*a.k;c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(mid.x,mid.y,b.x,b.y);c.stroke();}
  }
  box(c,p,0,93,z,620,12,25,'#c3b990');
}
function airfield(c,p) {
  const a=RUNWAY.z,b=RUNWAY.end,x=RUNWAY.x;
  polygon(c,[p(x-100,1,a-100),p(x+100,1,a-100),p(x+100,1,b+100),p(x-100,1,b+100)],'#9e9d73');
  polygon(c,[p(x-65,3,a),p(x+65,3,a),p(x+65,3,b),p(x-65,3,b)],'#344c4d');
  for(let z=a+30;z<b;z+=90){polygon(c,[p(x-3,3.5,z),p(x+3,3.5,z),p(x+3,3.5,z+45),p(x-3,3.5,z+45)],'#ecdfad');}
  for(const edge of [-58,58])polygon(c,[p(edge-1,3.5,a),p(edge+1,3.5,a),p(edge+1,3.5,b),p(edge-1,3.5,b)],'#f4e2ba');
  for(let xx=-45;xx<=45;xx+=18)polygon(c,[p(xx-5,4,a+15),p(xx+5,4,a+15),p(xx+5,4,a+55),p(xx-5,4,a+55)],'#eee0b5');
  for(let z=a;z<=b;z+=90)for(const xx of [-75,75]){const k=p(xx,5,z);if(k){c.fillStyle='#ffe4a3';c.beginPath();c.arc(k.x,k.y,Math.max(1.5,3*k.k),0,Math.PI*2);c.fill();}}
  box(c,p,200,0,a+350,65,38,95,'#c8c6a0');box(c,p,170,0,a+100,18,90,18,'#b1bba3');box(c,p,170,90,a+100,28,22,25,'#355e61');
}
function drawGate(c,p,g,active,s) {
  const q=p(g.x,g.alt,g.z);if(!q||q.depth<210||q.depth>3900)return;
  const radius=100*q.k;c.save();c.translate(q.x,q.y);c.lineWidth=active?Math.max(3,7*q.k):Math.max(1,3*q.k);c.strokeStyle=active?'#ffcd75':'#dbdba68a';
  c.shadowColor='#ffb94f';c.shadowBlur=active?15:0;c.beginPath();c.ellipse(0,0,radius,radius,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;
  c.lineWidth=2;c.strokeStyle='#fff0bc';
  for(let i=0;i<8;i++){const angle=i*Math.PI/4;c.beginPath();c.moveTo(Math.cos(angle)*(radius-8),Math.sin(angle)*(radius-8));c.lineTo(Math.cos(angle)*(radius+8),Math.sin(angle)*(radius+8));c.stroke();}
  if(active){c.font='bold 12px monospace';c.textAlign='center';c.fillStyle='#102f37';c.fillRect(-75,-radius-39,150,25);c.fillStyle='#ffdc91';c.fillText(`0${s.gateIndex+1}  /  ${Math.round((g.z-s.z)/10)*10} M`,0,-radius-22);}
  c.restore();
}
function deliveryBeacon(c,p,s) {
  if(s.delivered)return;
  const g=DELIVERY,q=p(g.x,170,g.z),base=p(g.x,2,g.z);if(!q||!base||q.depth<130||q.depth>4200)return;
  c.save();c.strokeStyle='#8df4d4';c.fillStyle='#71f5c61b';c.lineWidth=2;c.setLineDash([8,8]);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(base.x,base.y);c.stroke();c.setLineDash([]);
  c.beginPath();c.ellipse(base.x,base.y,120*base.k,25*base.k,0,0,Math.PI*2);c.fill();c.stroke();
  const r=65*q.k;polygon(c,[{x:q.x,y:q.y-r},{x:q.x+r,y:q.y},{x:q.x,y:q.y+r},{x:q.x-r,y:q.y}],'#104b4d88','#a7ffe1');
  c.fillStyle='#d0ffe6';c.textAlign='center';c.font='bold 12px monospace';c.fillText('AIRMAIL DROP',q.x,q.y-r-17);c.restore();
}
export function drawTerrain(c,s,w,h) {
  distantMountains(c,s,w,h);const projection=makeProjection(s,w,h),p=projection.project;
  terrainMesh(c,s,p);
  const objects=[{z:3220,draw:()=>viaduct(c,p)},{z:4980,draw:()=>village(c,p)},{z:6900,draw:()=>airfield(c,p)}];
  const base=Math.floor(s.z/160)*160;
  for(let iz=0;iz<27;iz++)for(let ix=-7;ix<8;ix++) {
    const z=base+iz*160+hash(ix,iz)*80,x=ix*135+hash(iz,ix)*90;
    if(Math.abs(x-riverCenter(z))<125||groundHeight(x,z)>350||z>4650&&z<5400&&x>100||z>6000&&Math.abs(x)<310)continue;
    objects.push({z,draw:()=>pine(c,p,x,z,25+hash(ix,z)*35)});
  }
  for(let i=s.gateIndex;i<GATES.length;i++){const g=GATES[i];objects.push({z:g.z,draw:()=>drawGate(c,p,g,i===s.gateIndex,s)});}
  objects.push({z:DELIVERY.z,draw:()=>deliveryBeacon(c,p,s)});
  objects.sort((a,b)=>b.z-a.z).forEach(o=>{if(o.z>s.z-100&&o.z<s.z+5000)o.draw();});
  for(const parcel of s.parcels){const q=p(parcel.x,parcel.alt,parcel.z);if(q){c.fillStyle='#f5cf79';c.fillRect(q.x-5*q.k,q.y-5*q.k,10*q.k,10*q.k);}}
  const fog=c.createLinearGradient(0,h*.2,0,h*.46);fog.addColorStop(0,'#b5cbb52c');fog.addColorStop(1,'#b5cbb500');c.fillStyle=fog;c.fillRect(0,h*.2,w,h*.28);
  return projection;
}
