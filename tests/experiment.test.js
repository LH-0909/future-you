import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PROFILE} from '../src/lib/engine.js';
import {isolateChange,compareHabit,experimentGoals,dimensionFeedback} from '../src/lib/experiment.js';
import {loadState,saveState} from '../src/lib/storage.js';
test('controlled experiment preserves all baseline inputs except the selected habit',()=>{
  const candidate={sleep:8,activity:300,sitting:2,diet:'balanced',breaks:true};
  assert.deepEqual(isolateChange(DEFAULT_PROFILE,candidate,'sleep'),{...DEFAULT_PROFILE,sleep:8});
  assert.deepEqual(isolateChange(DEFAULT_PROFILE,candidate,'sitting'),{...DEFAULT_PROFILE,sitting:2,breaks:true});
  assert.deepEqual(DEFAULT_PROFILE,{sleep:6.5,activity:90,sitting:8,diet:'mixed',breaks:false});
});
test('horizon counts planned behaviour, uses weekly activity units, and starts at the same point',()=>{
  const target={...DEFAULT_PROFILE,sleep:7.5};
  assert.equal(compareHabit(DEFAULT_PROFILE,target,'sleep',0).delta,0);
  assert.equal(compareHabit(DEFAULT_PROFILE,target,'sleep',30).delta,30);
  const movement=compareHabit(DEFAULT_PROFILE,{...DEFAULT_PROFILE,activity:160},'activity',7);
  assert.equal(movement.delta,70);assert.equal(movement.totalA,90);assert.equal(movement.totalB,160);
  assert.equal(compareHabit(DEFAULT_PROFILE,{...DEFAULT_PROFILE,sitting:7},'sitting',30).delta,-30);
  assert.equal(compareHabit(DEFAULT_PROFILE,{...DEFAULT_PROFILE,diet:'balanced'},'diet',30).numeric,false);
});
test('less beneficial changes stay explorable but are not offered as an improvement plan',()=>{
  assert.equal(compareHabit(DEFAULT_PROFILE,{...DEFAULT_PROFILE,sleep:4},'sleep',7).favorable,false);
  assert.equal(compareHabit(DEFAULT_PROFILE,DEFAULT_PROFILE,'sleep',7).favorable,false);
  assert.equal(compareHabit(DEFAULT_PROFILE,{...DEFAULT_PROFILE,breaks:true},'sitting',7).favorable,true);
});
test('all sleep-associated functional explanations follow the sleep change without altering other domains',()=>{
  const a={...DEFAULT_PROFILE,sleep:5},b={...a,sleep:8};
  for(const id of ['brain','heart','metabolism']){const feedback=dimensionFeedback(a,b,'sleep',id);assert.equal(feedback.linked,true);assert.notEqual(feedback.before,feedback.after);}
  assert.equal(dimensionFeedback(a,b,'sleep','lungs').linked,false);
});
test('experiment plan carries the actual selected target and storage restores isolated branches',()=>{
  const target={...DEFAULT_PROFILE,sleep:8},goals=experimentGoals(DEFAULT_PROFILE,target,'sleep');
  assert.match(goals[0].title,/8 小时/);
  let value;const storage={setItem:(_,v)=>value=v,getItem:()=>value};
  saveState({profile:DEFAULT_PROFILE,run:{baseline:DEFAULT_PROFILE,target:{...target,activity:420},habit:'sleep',days:30,step:2}},storage);
  const restored=loadState(storage).run;
  assert.equal(restored.target.activity,DEFAULT_PROFILE.activity);assert.equal(restored.target.sleep,8);assert.equal(restored.baseline.sleep,6.5);
});
