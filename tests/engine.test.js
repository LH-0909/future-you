import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProfile,DEFAULT_PROFILE,evaluateProfile,improvedProfile,scenarioAt,dateKey,planDates,actionGoals } from '../src/lib/engine.js';
import { loadState,saveState } from '../src/lib/storage.js';

test('untrusted saved parameters cannot inject invalid values into the simulation',()=>{
  assert.deepEqual(normalizeProfile(null),DEFAULT_PROFILE);
  const p=normalizeProfile({sleep:NaN,activity:99999,sitting:-7,diet:'unknown',breaks:'true'});
  assert.deepEqual(p,{sleep:6.5,activity:420,sitting:0,diet:'mixed',breaks:false});
  assert.equal(normalizeProfile({sleep:6.2}).sleep,6);
});
test('sleep and activity transitions use public-health recommendations; sitting uses no safety threshold',()=>{
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,sleep:6.5}).sleep.attention,true);
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,sleep:7}).sleep.attention,false);
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,activity:140}).activity.attention,true);
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,activity:150}).activity.attention,false);
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,sitting:2,breaks:false}).sitting.attention,true);
  assert.equal(evaluateProfile({...DEFAULT_PROFILE,sitting:12,breaks:true}).sitting.attention,false);
});
test('timeline and parallel branches agree and time never multiplies physiological outcomes',()=>{
  const baseline=normalizeProfile(DEFAULT_PROFILE),improved=improvedProfile(baseline);
  for(const stage of [0,1,2,3]) {
    assert.deepEqual(scenarioAt(baseline,stage,'keep').profile,baseline);
    assert.deepEqual(scenarioAt(baseline,stage,'improve').profile,stage===0?baseline:improved);
    assert.deepEqual(scenarioAt(baseline,stage,'improve').states,evaluateProfile(stage===0?baseline:improved));
  }
  assert.equal(scenarioAt(baseline,-4).stage,0);
  assert.equal(scenarioAt(baseline,9).stage,3);
});
test('Shanghai plan dates cross months correctly and reject invalid calendar dates',()=>{
  assert.equal(dateKey(new Date('2026-10-09T18:00:00Z')),'2026-10-10');
  assert.deepEqual(planDates('2026-10-29'),['2026-10-29','2026-10-30','2026-10-31','2026-11-01','2026-11-02','2026-11-03','2026-11-04']);
  assert.deepEqual(planDates('2026-02-30'),[]);
});
test('storage recovers from corrupt state and preserves frozen plan goals',()=>{
  let value='{';const storage={getItem:()=>value,setItem:(_,v)=>value=v};
  assert.equal(loadState(storage),null);
  const goals=actionGoals(DEFAULT_PROFILE),state={profile:DEFAULT_PROFILE,settings:{lowPower:true},plan:{start:'2026-10-09',goals,checks:{'2026-10-09:sleep':true,'2026-10-09:move':false,'2026-11-10:sleep':true,'invalid':true}}};
  assert.equal(saveState(state,storage),true);
  assert.deepEqual(loadState(storage).plan.goals,goals);
  assert.deepEqual(loadState(storage).plan.checks,{'2026-10-09:sleep':true});
  assert.equal(loadState(storage).settings.lowPower,true);
  assert.equal(saveState(state,{setItem:()=>{throw new Error('Quota');}}),false);
});
