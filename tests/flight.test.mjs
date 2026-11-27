import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('flight simulation exists as a standalone offline module', () => {
  assert.ok(existsSync(new URL('../game/src/flight.js', import.meta.url)));
});

async function simulation() { return import('../game/src/flight.js'); }
test('cruise advances, steering banks and climbing gains altitude', async () => {
  const { createFlight, stepFlight } = await simulation();
  const s = createFlight();
  for (let i=0;i<60;i++) stepFlight(s,{turn:1,pitch:1},1/60);
  assert.ok(s.z>50 && s.x>20 && s.alt>260 && s.bank>0);
});
test('centered gate is collected once and a missed gate is recorded', async () => {
  const { createFlight, stepFlight, GATES } = await simulation();
  const s=createFlight(); Object.assign(s,{z:GATES[0].z-1,x:GATES[0].x,alt:GATES[0].alt});
  stepFlight(s,{},.05); assert.equal(s.passed,1); assert.equal(s.gateIndex,1);
  Object.assign(s,{z:GATES[1].z-1,x:1000}); stepFlight(s,{},.05);
  assert.equal(s.passed,1);assert.equal(s.missed,1);
});
test('terrain collision ends flight and terminal states stay frozen', async () => {
  const { createFlight, stepFlight } = await simulation();
  const s=createFlight(); s.alt=0; stepFlight(s,{},.02);
  assert.equal(s.mode,'crashed'); const z=s.z;stepFlight(s,{},1);assert.equal(s.z,z);
});
test('stall loses altitude, fuel exhaustion ends the sortie', async () => {
  const { createFlight, stepFlight } = await simulation();
  const s=createFlight();Object.assign(s,{speed:30,throttle:0,alt:400});stepFlight(s,{},.1);
  assert.ok(s.alt<400 && s.stall);s.fuel=0;stepFlight(s,{},.1);assert.equal(s.mode,'crashed');
});
test('parcel requires deliberate drop inside the delivery zone', async () => {
  const { createFlight, stepFlight, DELIVERY } = await simulation();
  const s=createFlight();Object.assign(s,{z:DELIVERY.z,x:DELIVERY.x,alt:180,gateIndex:5});
  stepFlight(s,{},.01);assert.equal(s.delivered,false);
  stepFlight(s,{drop:true},.01);assert.equal(s.delivered,true);
});
test('safe runway touchdown lands; high-speed touchdown crashes', async () => {
  const { createFlight, stepFlight, RUNWAY } = await simulation();
  for (const speed of [48,95]) {
    const s=createFlight();Object.assign(s,{x:RUNWAY.x,z:RUNWAY.z+100,alt:7,speed,throttle:.2,gear:true,delivered:true,passed:4,vy:-2});
    stepFlight(s,{},.02);assert.equal(s.mode,speed===48?'landed':'crashed');
  }
});
