import {clamp,nextWaypoint,GATES,RUNWAY} from './flight.js';
import {drawTerrain,polygon} from './terrain.js';
const C={ink:'#102c35',panel:'#102a32ed',line:'#b7d0bd50',cream:'#f1e6c8',muted:'#9bbcaf',gold:'#ffcb73',mint:'#8ee4c2',red:'#ff9477'};
function text(c,value,x,y,size=14,color=C.cream,align='left',font='monospace') {
  c.fillStyle=color;c.font=`${size>=24?'bold ':''}${size}px ${font}`;c.textAlign=align;c.fillText(value,x,y);
}
function panel(c,x,y,w,h){c.fillStyle=C.panel;c.fillRect(x,y,w,h);c.strokeStyle=C.line;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);}
function line(c,x,y,x2,y2,color=C.line,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function aircraft(c,s,time,reduced) {
  const x=640+(reduced?0:s.vx*.12),y=490+(reduced?0:Math.sin(time*2)*1.5)+s.vy*.06;
  c.save();c.translate(x,y);c.rotate(s.bank*.57);
  for(const side of [-1,1]){c.strokeStyle='#e0e6ce36';c.lineWidth=1.5;c.beginPath();c.moveTo(side*135,-11);c.quadraticCurveTo(side*143,46,side*155-s.vx*.14,110);c.stroke();}
  c.shadowColor='#102b3b77';c.shadowBlur=10;c.shadowOffsetY=10;
  polygon(c,[{x:-145,y:-7},{x:-138,y:-26},{x:-25,y:-39},{x:25,y:-39},{x:138,y:-26},{x:145,y:-7},{x:28,y:3},{x:-28,y:3}],'#ece2bd');
  c.shadowBlur=0;c.shadowOffsetY=0;
  polygon(c,[{x:-145,y:-7},{x:-138,y:-16},{x:-23,y:-23},{x:23,y:-23},{x:138,y:-16},{x:145,y:-7},{x:28,y:3},{x:-28,y:3}],'#b5bba7');
  for(const side of [-1,1]) {
    polygon(c,[{x:side*112,y:-29},{x:side*128,y:-27},{x:side*135,y:-8},{x:side*116,y:-5}],'#e59d42');
    line(c,side*45,-36,side*45,-3,'#6c8874',1);line(c,side*86,-32,side*86,-1,'#6c8874',1);line(c,side*25,30,side*90,-7,'#375954',3);
  }
  polygon(c,[{x:-57,y:50},{x:-49,y:37},{x:-9,y:31},{x:9,y:31},{x:49,y:37},{x:57,y:50},{x:8,y:57},{x:-8,y:57}],'#e1d6b2');
  polygon(c,[{x:-57,y:50},{x:-50,y:44},{x:50,y:44},{x:57,y:50},{x:8,y:57},{x:-8,y:57}],'#cf893c');
  c.fillStyle='#e7dfbd';c.beginPath();c.moveTo(0,-83);c.bezierCurveTo(28,-78,22,-25,13,16);c.lineTo(7,65);c.quadraticCurveTo(0,77,-7,65);c.lineTo(-13,16);c.bezierCurveTo(-22,-25,-28,-78,0,-83);c.fill();
  polygon(c,[{x:0,y:-81},{x:16,y:-63},{x:9,y:52},{x:3,y:66},{x:0,y:12}],'#c5c9ad');
  c.fillStyle='#204b56';c.beginPath();c.moveTo(-13,-57);c.quadraticCurveTo(0,-69,13,-57);c.lineTo(11,-23);c.quadraticCurveTo(0,-16,-11,-23);c.closePath();c.fill();
  polygon(c,[{x:-10,y:-55},{x:-1,y:-60},{x:-3,y:-28},{x:-9,y:-25}],'#a9dad055');line(c,-13,-40,13,-40,'#86a998',2);
  polygon(c,[{x:-4,y:51},{x:-3,y:16},{x:0,y:-8},{x:7,y:14},{x:9,y:54}],'#245c5c');
  polygon(c,[{x:0,y:-8},{x:7,y:14},{x:9,y:54},{x:4,y:51}],'#3f8280');
  polygon(c,[{x:-4,y:38},{x:7,y:38},{x:8,y:47},{x:-4,y:47}],'#f5c36d');
  c.strokeStyle='#f8e9bd66';c.lineWidth=4;c.beginPath();c.ellipse(0,-82,31,5,0,0,Math.PI*2);c.stroke();
  if(!reduced)line(c,-28*Math.cos(time*50),-82,28*Math.cos(time*50),-82,'#dce4c1aa',3);
  c.fillStyle=C.red;c.beginPath();c.arc(-140,-16,3,0,7);c.fill();c.fillStyle=C.mint;c.beginPath();c.arc(140,-16,3,0,7);c.fill();
  if(s.gear)for(const side of [-1,1]){line(c,side*15,8,side*26,34,'#314a47',3);c.fillStyle='#16323a';c.fillRect(side*26-4,31,8,13);}
  c.restore();
}
function tape(c,label,value,unit,x,y,color) {
  panel(c,x,y,92,162);text(c,label,x+46,y+22,11,C.muted,'center');
  for(let i=-2;i<=2;i++){const yy=y+83+i*24;line(c,x+9,yy,x+19,yy,C.line);text(c,Math.round(value/10)*10-i*10,x+76,yy+4,11,C.muted,'right');}
  c.fillStyle=color;c.fillRect(x+2,y+64,88,36);text(c,String(Math.round(value)).padStart(3,'0'),x+46,y+90,26,C.ink,'center');text(c,unit,x+46,y+148,10,C.muted,'center');
}
function compass(c,s) {
  const hdg=(Math.atan2(s.vx,s.speed)*180/Math.PI+360)%360;panel(c,477,91,326,37);
  for(let i=-4;i<=4;i++){const x=640+i*35;line(c,x,96,x,i===0?107:102,C.muted);const v=(Math.round(hdg/10)*10+i*10+360)%360;text(c,v===0?'N':String(v).padStart(3,'0'),x,120,11,C.muted,'center');}
  polygon(c,[{x:634,y:90},{x:646,y:90},{x:640,y:99}],C.gold);return hdg;
}
function gauge(c,x,y,value,max,label,unit,color=C.gold) {
  const r=30;c.lineCap='round';c.strokeStyle='#36514f';c.lineWidth=5;c.beginPath();c.arc(x,y,r,Math.PI*.8,Math.PI*2.2);c.stroke();
  const a=Math.PI*.8+clamp(value/max,0,1)*Math.PI*1.4;c.strokeStyle=color;c.beginPath();c.arc(x,y,r,Math.PI*.8,a);c.stroke();
  line(c,x,y,x+Math.cos(a)*23,y+Math.sin(a)*23,color,2);c.lineCap='butt';c.fillStyle=C.cream;c.beginPath();c.arc(x,y,3,0,7);c.fill();text(c,label,x,y+43,9,C.muted,'center');text(c,unit,x,y+58,10,C.cream,'center');
}
function routeMap(c,s,x,y,w,h) {
  panel(c,x,y,w,h);text(c,'VALLEY ROUTE',x+12,y+18,10,C.muted);text(c,'N ↑',x+w-12,y+18,10,C.gold,'right');
  const map=(xx,zz)=>({x:x+w/2+xx*.048,y:y+h-13-(zz/7500)*(h-45)});
  c.strokeStyle='#558e88';c.lineWidth=3;c.beginPath();for(let z=0;z<=7500;z+=100){const p=map(Math.sin(z*.0013)*140+Math.sin(z*.003)*65,z);if(z===0)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);}c.stroke();
  for(let i=0;i<GATES.length;i++){const p=map(GATES[i].x,GATES[i].z);c.strokeStyle=i<s.gateIndex?C.mint:C.gold;c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,3.5,0,7);c.stroke();}
  const runway=map(0,RUNWAY.z);c.fillStyle=C.cream;c.fillRect(runway.x-2,runway.y-8,4,12);const p=map(s.x,s.z);polygon(c,[{x:p.x,y:p.y-6},{x:p.x-5,y:p.y+5},{x:p.x+5,y:p.y+5}],C.cream);
}
function hud(c,s,options) {
  const wp=nextWaypoint(s),distance=Math.max(0,wp.z-s.z),hdg=compass(c,s);
  panel(c,24,22,350,58);c.fillStyle=C.gold;c.fillRect(24,22,5,58);text(c,'AMBERLINE',43,48,21,C.cream,'left','sans-serif');text(c,'AIRPOST   /   VALLEY SERVICE 07',44,67,10,C.gold);
  panel(c,392,22,438,58);text(c,wp.kind==='gate'?`NAVIGATION  /  ${wp.name}`:wp.kind==='delivery'?'AIRMAIL  /  POSTMASTER VILLAGE':'FINAL APPROACH  /  AMBERLINE FIELD',411,44,12,C.muted);
  text(c,wp.kind==='gate'?`RING 0${s.gateIndex+1}     ${Math.round(distance)} M`:wp.kind==='delivery'?'CYAN BEACON  ·  SPACE TO DROP':'GEAR DOWN  ·  75–118 KT',411,67,18,C.gold);
  panel(c,848,22,408,58);text(c,`POSTMARKS ${s.passed}/5`,867,45,13,C.muted);text(c,String(s.score).padStart(5,'0'),1237,65,28,C.cream,'right');text(c,'SCORE',1236,39,10,C.muted,'right');
  tape(c,'AIRSPEED',s.speed*1.944,'KNOTS',24,238,C.gold);tape(c,'ALTITUDE',s.alt,'METRES MSL',1164,238,C.mint);
  const aimX=640+clamp((wp.x-s.x)*.13,-180,180),aimY=360-clamp((wp.alt-s.alt)*.15,-60,60);c.strokeStyle='#e7eed18c';c.lineWidth=1.2;c.beginPath();c.arc(aimX,aimY,10,0,Math.PI*2);c.moveTo(aimX-19,aimY);c.lineTo(aimX-10,aimY);c.moveTo(aimX+10,aimY);c.lineTo(aimX+19,aimY);c.stroke();
  if(options.mouse){c.strokeStyle=C.mint;c.beginPath();c.arc(options.pointer.x,options.pointer.y,14,0,7);c.stroke();}
  if(s.messageTime>0){panel(c,420,151,440,31);text(c,s.message,640,172,13,C.gold,'center');}
  if(s.stall){panel(c,514,198,252,36);text(c,'STALL · INCREASE THROTTLE',640,221,12,C.red,'center');}
  else if(s.alt<(s.gateIndex<5?55:20))text(c,'LOW ALTITUDE',640,214,13,C.red,'center');
  panel(c,24,590,1232,106);gauge(c,79,630,s.throttle,1,'THROTTLE',`${Math.round(s.throttle*100)}%`);line(c,135,604,135,680);gauge(c,185,630,(s.bank/.6+1)/2,1,'ATTITUDE',s.vy>1?'CLIMB':s.vy< -1?'DESCEND':'LEVEL',C.mint);line(c,239,604,239,680);
  text(c,'ALT',266,614,10,C.muted);text(c,`${Math.round(s.alt)}`,266,649,29,C.mint);text(c,'M',338,649,12,C.muted);text(c,'SPD',383,614,10,C.muted);text(c,`${Math.round(s.speed*1.944)}`,383,649,29,C.gold);text(c,'KT',452,649,12,C.muted);text(c,'HDG',493,614,10,C.muted);text(c,`${String(Math.round(hdg)%360).padStart(3,'0')}°`,493,649,29);text(c,'MAG',493,674,10,C.muted);
  line(c,592,604,592,680);text(c,'FUEL',614,615,10,C.muted);text(c,`${Math.ceil(s.fuel)}%`,614,643,23,s.fuel<20?C.red:C.cream);c.fillStyle='#38514d';c.fillRect(615,655,120,5);c.fillStyle=C.mint;c.fillRect(615,655,Math.max(0,s.fuel)*1.2,5);text(c,`AIRFRAME ${s.integrity}%`,614,678,10,C.muted);
  line(c,758,604,758,680);text(c,'FLIGHT TIME',780,615,10,C.muted);text(c,`${String(Math.floor(s.time/60)).padStart(2,'0')}:${String(Math.floor(s.time%60)).padStart(2,'0')}`,780,645,26);text(c,s.gear?'● GEAR DOWN':'○ GEAR UP',780,674,11,s.gear?C.mint:C.muted);
  text(c,s.delivered?'✉ MAIL DELIVERED':'✉ AIRMAIL ABOARD',960,615,11,s.delivered?C.mint:C.gold);text(c,'W/S THROTTLE   G GEAR',960,641,10,C.muted);text(c,'P PAUSE   M MOUSE   Q SOUND',960,661,10,C.muted);text(c,'ARROWS STEER / CLIMB',960,681,10,C.muted);
  routeMap(c,s,1095,415,161,156);text(c,'CANVAS 2D  /  AMBERLINE VALLEY',25,714,9,C.muted);text(c,`${options.sound?'SOUND ON':'SOUND OFF'}   ·   ${options.reduced?'REDUCED MOTION':'V REDUCE MOTION'}   ·   F FULLSCREEN`,1255,714,9,C.muted,'right');
  if(wp.kind==='runway'){
    panel(c,25,429,285,126);text(c,'LANDING CHECKLIST',40,451,12,C.gold);
    const checks=[[s.gear,'G  LOWER LANDING GEAR'],[s.speed>=38&&s.speed<=61,'W/S  HOLD 75–118 KT'],[Math.abs(s.x)<65,'ALIGN WITH RUNWAY'],[Math.abs(s.vy)<18,'GENTLE DESCENT <18 M/S']];checks.forEach(([ok,t],i)=>text(c,`${ok?'✓':'○'} ${t}`,40,474+i*22,11,ok?C.mint:C.cream));
  }
}
function briefing(c) {
  c.fillStyle='#081f2ad9';c.fillRect(0,0,1280,720);text(c,'AMBERLINE AIRPOST',78,99,17,C.gold);text(c,'A valley. A plane.',73,184,59,C.cream,'left','sans-serif');text(c,'A promise.',73,248,59,C.cream,'left','sans-serif');text(c,'THE EVENING MAIL RUN',78,297,14,C.mint);
  text(c,'Five postmarks through the canyon. One parcel for the village.',78,335,17,C.cream,'left','sans-serif');text(c,'Bring your little aeroplane home before the tank runs dry.',78,364,17,C.cream,'left','sans-serif');
  const items=[['01','FOLLOW THE AMBER RINGS','Trim your turns. Fly through the centre for perfect-line bonuses.'],['02','DELIVER THE AIRMAIL','Over the cyan village beacon: 65–270 m, then press SPACE.'],['03','LAND AT AMBERLINE FIELD','Gear down. Align. Slow to 75–118 kt and descend gently.']];items.forEach((a,i)=>{const y=413+i*67;text(c,a[0],80,y,17,C.gold);text(c,a[1],122,y,13,C.mint);text(c,a[2],122,y+23,14,C.cream,'left','sans-serif');});
  panel(c,825,148,370,346);text(c,'PILOT’S NOTES',851,184,15,C.gold);
  const notes=[['↑ / ↓','CLIMB / DESCEND'],['← / →','BANK & TURN'],['W / S','MORE / LESS THROTTLE'],['SPACE','DROP AIRMAIL'],['G','LANDING GEAR'],['M / CLICK','MOUSE STEERING'],['P / ESC','PAUSE'],['V / Q','REDUCE MOTION / SOUND']];notes.forEach(([key,action],i)=>{text(c,key,852,220+i*33,13,C.cream);text(c,action,1169,220+i*33,11,C.muted,'right');});
  c.fillStyle=C.gold;c.fillRect(78,624,315,51);text(c,'LAUNCH FLIGHT   ↗',235,657,17,C.ink,'center');text(c,'PRESS ENTER OR CLICK',414,655,12,C.muted);text(c,'ORIGINAL CANVAS FLIGHT EXPERIENCE  /  NO DOWNLOADS. JUST FLY.',1195,681,9,C.muted,'right');
}
function overlay(c,s,mode) {
  c.fillStyle='#081f2ac9';c.fillRect(0,0,1280,720);panel(c,350,172,580,364);text(c,mode==='paused'?'HOLDING PATTERN':mode==='landed'?'THE VALLEY SAYS THANK YOU':'FLIGHT ENDED',640,222,13,C.gold,'center');text(c,mode==='paused'?'Flight paused':mode==='landed'?'Welcome home.':'One more run?',640,292,43,C.cream,'center','sans-serif');text(c,mode==='paused'?'P or ESC to resume · R starts a fresh flight':s.reason,640,337,14,C.muted,'center');
  if(mode!=='paused'){text(c,`${s.passed}/5 POSTMARKS   ·   ${s.delivered?'MAIL DELIVERED':'MAIL ABOARD'}`,640,378,14,C.mint,'center');text(c,`${s.score} POINTS   /   ${s.time.toFixed(1)} SECONDS`,640,408,19,C.gold,'center');}
  c.fillStyle=C.gold;c.fillRect(480,455,320,49);text(c,mode==='paused'?'RESUME FLIGHT':'FLY AGAIN  ·  ENTER',640,486,16,C.ink,'center');
}
export function renderFlight(c,s,options) {
  c.clearRect(0,0,1280,720);drawTerrain(c,s,1280,720);aircraft(c,s,s.time,options.reduced);hud(c,s,options);
  if(s.mode==='briefing')briefing(c);else if(s.mode!=='flying')overlay(c,s,s.mode);
}
