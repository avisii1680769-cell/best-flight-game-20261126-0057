import {createFlight,stepFlight,clamp,nextWaypoint} from './flight.js';
import {renderFlight} from './render.js';
const canvas=document.getElementById('flight'),context=canvas.getContext('2d',{alpha:false});
let state=createFlight();state.mode='briefing';
const keys=new Set();let manual=false,last=0,audio=null,lastEvent=0;
const options={sound:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,mouse:false,pointer:{x:640,y:360}};
function startFlight(){state=createFlight();lastEvent=0;keys.clear();options.mouse=false;unlockAudio();canvas.focus();}
function unlockAudio(){if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();}
function chime(success){
  if(!audio||!options.sound)return;const t=audio.currentTime;
  for(let i=0;i<3;i++){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=(success?440:165)*[1,1.25,1.5][i];gain.gain.setValueAtTime(0,t+i*.09);gain.gain.linearRampToValueAtTime(.045,t+i*.09+.015);gain.gain.exponentialRampToValueAtTime(.001,t+i*.09+.32);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(t+i*.09);oscillator.stop(t+i*.09+.34);}
}
function pause(){if(state.mode==='flying'){state.mode='paused';keys.clear();}else if(state.mode==='paused')state.mode='flying';}
function point(e){const r=canvas.getBoundingClientRect();options.pointer={x:(e.clientX-r.left)*1280/r.width,y:(e.clientY-r.top)*720/r.height};}
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter'].includes(key))e.preventDefault();
  if(!e.repeat){
    if(key==='enter'&&['briefing','landed','crashed'].includes(state.mode))startFlight();else if(key==='r')startFlight();else if(key==='p'||key==='escape')pause();else if(key==='g'&&state.mode==='flying')state.gear=!state.gear;else if(key==='m')options.mouse=!options.mouse;else if(key==='q')options.sound=!options.sound;else if(key==='v')options.reduced=!options.reduced;else if(key==='f'){if(document.fullscreenElement)document.exitFullscreen();else canvas.requestFullscreen?.();}
  }
  if(key.startsWith('arrow'))options.mouse=false;keys.add(key);render();
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();if(state.mode==='flying')state.mode='paused';});
canvas.addEventListener('pointermove',point);
canvas.addEventListener('pointerdown',e=>{point(e);unlockAudio();if(['briefing','crashed','landed'].includes(state.mode))startFlight();else if(state.mode==='paused')pause();else options.mouse=!options.mouse;render();});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.mode==='flying')state.throttle=clamp(state.throttle-e.deltaY*.0006,0,1);},{passive:false});
function update(dt){
  const turn=options.mouse?clamp((options.pointer.x-640)/300,-1,1):Number(keys.has('arrowright'))-Number(keys.has('arrowleft'));
  const pitch=options.mouse?clamp((360-options.pointer.y)/220,-1,1):Number(keys.has('arrowup'))-Number(keys.has('arrowdown'));
  stepFlight(state,{turn,pitch,throttle:Number(keys.has('w'))-Number(keys.has('s')),drop:keys.has(' '),brake:keys.has('b')},dt);
  if(state.event!==lastEvent){chime(state.mode!=='crashed'&&!state.message.startsWith('Ring missed'));lastEvent=state.event;}
}
function render(){renderFlight(context,state,options);}
window.render_game_to_text=()=>JSON.stringify({
  coordinateSystem:'x east, z north along valley, alt metres above sea level; canvas 1280×720 top-left origin',
  mode:state.mode,x:state.x,z:state.z,alt:state.alt,speed:state.speed,heading:(Math.atan2(state.vx,state.speed)*180/Math.PI+360)%360,
  vx:state.vx,vy:state.vy,bank:state.bank,throttle:state.throttle,fuel:state.fuel,integrity:state.integrity,time:state.time,
  passed:state.passed,missed:state.missed,gateIndex:state.gateIndex,delivered:state.delivered,gear:state.gear,stall:state.stall,
  score:state.score,reason:state.reason,message:state.message,waypoint:nextWaypoint(state),mouse:options.mouse,sound:options.sound,reducedMotion:options.reduced,
});
window.advanceTime=ms=>{manual=true;const steps=Math.max(1,Math.round(ms/(1000/60)));for(let i=0;i<steps;i++)update(1/60);render();};
function frame(now){if(!manual&&last)update(Math.min(.04,(now-last)/1000));last=now;render();requestAnimationFrame(frame);}
render();requestAnimationFrame(frame);
