// Metres, seconds, right-handed route: x east, alt up, z north along the valley.
export const GATES = [
  {x:-80,alt:260,z:800,name:'RIVER MOUTH'},
  {x:170,alt:310,z:1650,name:'TWIN PINES'},
  {x:270,alt:380,z:2550,name:'HIGH PASS'},
  {x:-180,alt:260,z:3450,name:'STONE VIADUCT'},
  {x:-130,alt:200,z:4300,name:'POSTMASTER TURN'},
];
export const DELIVERY = {x:140,z:5100,alt:170};
export const RUNWAY = {x:0,z:6500,end:7350};
export const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const riverCenter = z => Math.sin(z*.0013)*140+Math.sin(z*.003)*65;
export function groundHeight(x,z) {
  if(z>5950 && Math.abs(x)<300) return 0;
  const d=Math.abs(x-riverCenter(z));
  return d<460?0:Math.max(0,(d-460)*.48)*(1+.32*Math.sin(z*.002+x*.003));
}
export function createFlight() {
  return {mode:'flying',x:0,z:0,alt:260,speed:72,throttle:.64,vx:0,vy:0,bank:0,
    fuel:100,integrity:100,time:0,score:0,gateIndex:0,passed:0,missed:0,delivered:false,
    gear:false,stall:false,combo:0,event:0,message:'Follow the amber rings',messageTime:4,
    trail:[],parcels:[],landingQuality:0,reason:'',lastDrop:false};
}
function announce(s,message,score=0) {
  s.message=message;s.messageTime=3.5;s.score+=score;s.event++;
}
function crash(s,reason) {
  s.mode='crashed';s.reason=reason;announce(s,reason);s.integrity=0;
}
export function stepFlight(s,input,dt) {
  if(s.mode!=='flying') return;
  dt=clamp(dt,0,.05);s.time+=dt;s.messageTime=Math.max(0,s.messageTime-dt);
  s.throttle=clamp(s.throttle+(input.throttle||0)*dt*.32,0,1);
  const target=36+s.throttle*65-(s.gear?13:0)-(input.brake?18:0);
  s.speed+=(target-s.speed)*dt*.7;
  s.stall=s.speed<42;
  const response=clamp(s.speed/65,.35,1.4);
  s.vx+=((input.turn||0)*130*response-s.vx)*Math.min(1,dt*3);
  const sink=s.stall?-(42-s.speed)*4:0;
  s.vy+=((input.pitch||0)*95*response+sink-s.vy)*Math.min(1,dt*3);
  s.x+=s.vx*dt;s.alt+=s.vy*dt;s.z+=s.speed*dt;
  s.bank+=((input.turn||0)*.55-s.bank)*Math.min(1,dt*5);
  s.fuel-=dt*(.30+s.throttle*.22);
  s.alt=Math.min(850,s.alt);
  s.trail.push({x:s.x,alt:s.alt,z:s.z});if(s.trail.length>90)s.trail.shift();
  const gate=GATES[s.gateIndex];
  if(gate && s.z>=gate.z) {
    const miss=Math.hypot(s.x-gate.x,s.alt-gate.alt);
    if(miss<100) {s.passed++;s.combo++;announce(s,miss<38?'PERFECT LINE  +350':'POSTMARK COLLECTED  +200',miss<38?350:200);}
    else {s.missed++;s.combo=0;announce(s,'Ring missed · next waypoint ahead');}
    s.gateIndex++;
  }
  if(input.drop&&!s.lastDrop&&!s.delivered) {
    const inZone=Math.abs(s.z-DELIVERY.z)<220&&Math.abs(s.x-DELIVERY.x)<160&&s.alt>65&&s.alt<270;
    if(inZone) {s.delivered=true;s.parcels.push({x:s.x,alt:s.alt,z:s.z});announce(s,'AIRMAIL DELIVERED  +800',800);}
    else announce(s,'Not in drop zone · aim for the cyan beacon');
  }
  s.lastDrop=!!input.drop;
  for(const p of s.parcels)p.alt=Math.max(0,p.alt-dt*50);
  if(!s.delivered&&s.z>DELIVERY.z+250&&s.z-s.speed*dt<=DELIVERY.z+250)announce(s,'Delivery missed · land safely to complete the flight');
  if(s.alt<=groundHeight(s.x,s.z)+8) {
    const strip=s.z>=RUNWAY.z&&s.z<=RUNWAY.end&&Math.abs(s.x-RUNWAY.x)<65;
    if(strip&&s.gear&&s.speed>=38&&s.speed<=61&&Math.abs(s.vy)<18&&Math.abs(s.vx)<18) {
      s.mode='landed';s.alt=8;s.landingQuality=Math.round(100-Math.abs(s.vy)*2-Math.abs(s.x)*.4);
      announce(s,'WELCOME HOME',500+Math.max(0,s.landingQuality)*5);s.reason=s.delivered?'The valley has its mail.':'Safe arrival · parcel undelivered';
    } else crash(s,strip?'Hard landing · gear down, 75–118 kt, sink below 18 m/s':'Terrain strike · watch your altitude');
  }
  if(s.fuel<=0&&s.mode==='flying')crash(s,'Fuel exhausted · use an economical throttle');
  if(s.z>RUNWAY.end+350&&s.mode==='flying')crash(s,'Airfield overshot · descend earlier on the next flight');
}
export function nextWaypoint(s) {
  if(s.gateIndex<GATES.length)return {...GATES[s.gateIndex],kind:'gate',index:s.gateIndex+1};
  if(!s.delivered&&s.z<DELIVERY.z+250)return {...DELIVERY,name:'DROP THE AIRMAIL',kind:'delivery'};
  return {...RUNWAY,alt:15,name:'AMBERLINE FIELD',kind:'runway'};
}
