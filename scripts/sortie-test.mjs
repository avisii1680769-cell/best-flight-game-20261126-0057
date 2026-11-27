// A real Chromium pilot: inputs only. Never injects or edits game state.
import { chromium } from '/opt/muse/assets/spaces/ts-runtime/dist/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['serve.ts'],{stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const browser=await chromium.launch({executablePath:'/home/hatch/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()));
const trace=[],shots=[];mkdirSync('screenshots',{recursive:true});mkdirSync('artifacts',{recursive:true});
async function capture(name,s){const path=`screenshots/${name}.jpg`;await page.screenshot({path,type:'jpeg',quality:85});shots.push({file:path,state:s,capture:'Playwright page.screenshot, Chromium, 1280x720, unedited'});}
try {
  await page.goto('http://127.0.0.1:8080');await page.waitForFunction(()=>window.render_game_to_text);
  await page.screenshot({path:'artifacts/briefing.png'});
  await page.keyboard.press('Enter');await page.evaluate(()=>window.advanceTime(1));
  await page.mouse.click(640,360);
  let delivered=false;
  for(let i=0;i<1000;i++){
    const s=await state();trace.push({mode:s.mode,x:s.x,z:s.z,alt:s.alt,speed:s.speed,passed:s.passed,delivered:s.delivered});
    if(s.mode!=='flying')break;
    const wp=s.waypoint;
    const approach=s.delivered||s.z>5350;
    const targetX=approach?0:wp.x;
    const targetAlt=approach?Math.max(6,(6550-s.z)*.12):wp.alt;
    const turn=clamp(((targetX-s.x)*.85-s.vx*.8)/130,-1,1);
    const pitch=clamp(((targetAlt-s.alt)*.85-s.vy*.8)/95,-1,1);
    await page.mouse.move(640+turn*300,360-pitch*220);
    if(approach&&s.throttle>.4){await page.keyboard.down('s');}else await page.keyboard.up('s');
    if(s.z>5600&&!s.gear)await page.keyboard.press('g');
    if(!delivered&&s.z>4980&&s.z<5300){await page.keyboard.down('Space');await page.evaluate(()=>window.advanceTime(34));await page.keyboard.up('Space');delivered=(await state()).delivered;}
    if(s.z>2050&&!shots.some(a=>a.file.includes('01-')))await capture('01-high-pass',s);
    if(s.z>4820&&!shots.some(a=>a.file.includes('02-')))await capture('02-airmail-village',s);
    if(s.z>6090&&!shots.some(a=>a.file.includes('03-')))await capture('03-final-approach',s);
    await page.evaluate(()=>window.advanceTime(200));
  }
  await page.keyboard.up('s');
  const final=await state();await capture('04-home',final);
  writeFileSync('artifacts/sortie-trace.json',JSON.stringify({shots,final,errors,requests,trace},null,2));
  assert.equal(final.passed,5);assert.equal(final.delivered,true);assert.equal(final.mode,'landed');
  assert.deepEqual(errors,[]);assert.ok(requests.every(x=>x.startsWith('http://127.0.0.1:8080/')));
  console.log(JSON.stringify({result:'PASS',passed:final.passed,delivered:final.delivered,mode:final.mode,score:final.score,time:final.time,errors,shots:shots.map(x=>x.file)},null,2));
}finally{await browser.close();server.kill();}
