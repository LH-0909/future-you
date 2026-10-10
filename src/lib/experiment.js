import { normalizeProfile, actionGoals, evaluateProfile } from './engine.js';

// The model maps behaviours to educational topics, not measured organ health.
export const habitRules = {
  sleep: { name:'睡眠', icon:'moon', organ:'brain', source:'sleep', affected:['brain','heart','metabolism'], question:'如果每天多留一点睡眠时间？', chain:['留出睡眠机会','支持注意力与情绪调节','关注长期心血管与代谢健康'], why:'睡眠支持注意力、记忆和情绪调节，也与心脏和代谢健康有关。时长、质量和规律性需要一起关注。', short:'这一周可以记录白天困倦、注意力和起床时间，看看新作息是否可行。', long:'长期保持足够且规律的睡眠，有助于健康。不能据此确定你在某一天的器官状态。' },
  activity: { name:'运动', icon:'activity', organ:'heart', source:'activity', affected:['heart','lungs','muscle','brain'], question:'如果每周增加一些有氧活动？', chain:['骨骼肌产生运动','呼吸与循环系统协作','规律活动支持身心健康'], why:'运动需要肌肉、肺和心脏协同工作。规律活动支持心肺适能，也与脑健康和心理健康有关；少量活动也比完全不活动好。', short:'先记录完成了多少分钟、活动强度和感受，逐步增加，避免突然加量。', long:'持续活动支持长期适能与健康；本体验不能计算你的心肺提升百分比或体重变化。' },
  sitting: { name:'久坐', icon:'chair', organ:'muscle', source:'sedentary', affected:['muscle','heart','metabolism'], question:'如果用走动替代一部分久坐？', chain:['减少低能量消耗的坐姿时间','用走动替代部分久坐','增加全天活动机会'], why:'久坐是清醒时低能量消耗的行为。WHO 建议减少久坐，用任何强度的活动替代部分久坐。这里不设置“坐多久绝对安全”的界线。', short:'找到课程、通勤或工作中的活动机会；有计划地起身，比只记住“少坐”更容易实践。', long:'长期保持更活跃的生活方式是目标。活动间歇的安排不代表久坐风险已被抵消。' },
  diet: { name:'饮食', icon:'leaf', organ:'metabolism', source:'diet', affected:['metabolism'], question:'如果下一杯甜饮换成水？', chain:['选择食物与饮料','消化吸收提供营养和能量','长期饮食结构影响健康'], why:'饮食科普关注长期结构：多样化搭配、减少游离糖和盐。一个饮食选项无法测出你的血糖，也无法得出具体营养摄入量。', short:'先选择一件可记录的行动，例如下一杯选水或下一餐增加蔬菜。', long:'持续多样化搭配有助于健康；饮食选择不能换算为个人血糖曲线或疾病概率。' },
};
export const dimensions = [
  {id:'brain',name:'注意力与情绪',icon:'brain',inputs:['sleep','activity']},
  {id:'heart',name:'心血管与活动',icon:'heart',inputs:['sleep','activity','sitting']},
  {id:'lungs',name:'呼吸与有氧活动',icon:'wind',inputs:['activity']},
  {id:'muscle',name:'骨骼肌肉与活动',icon:'activity',inputs:['activity','sitting']},
  {id:'metabolism',name:'饮食与代谢',icon:'leaf',inputs:['diet','sleep','sitting']},
];
export const inputFact = (p,id) => id==='sleep'?`${p.sleep} 小时 / 晚`:id==='activity'?`${p.activity} 分钟 / 周`:id==='sitting'?`${p.sitting} 小时 / 天 · ${p.breaks?'有活动间歇':'未安排间歇'}`:p.diet==='balanced'?'多样搭配 / 水优先':p.diet==='mixed'?'搭配有待改善':'常喝甜饮 / 外卖';
export function dimensionFeedback(baseline,target,habit,dimension) {
  const a=normalizeProfile(baseline),b=isolateChange(a,target,habit);
  if(!habitRules[habit].affected.includes(dimension))return {linked:false,label:'本次未改变关联习惯',before:'保留原始画像',after:'保留原始画像'};
  const describe=p=>habit==='sleep'?(p.sleep<7?'睡眠机会低于一般建议':'留出达到一般建议的睡眠机会'):habit==='activity'?(p.activity<150?'活动量低于一般最低建议':'活动量达到一般最低建议'):habit==='sitting'?(p.breaks?'已安排起身活动机会':'尚未安排活动间歇'):p.diet==='balanced'?'选择更多样的饮食':'饮食结构仍可调整';
  return {linked:true,label:evaluateProfile(b)[habit].label,before:describe(a),after:describe(b),beforeFact:inputFact(a,habit),afterFact:inputFact(b,habit)};
}
export function isolateChange(baseline, candidate, habit) {
  const a=normalizeProfile(baseline),b=normalizeProfile(candidate);
  return habit==='sitting'?{...a,sitting:b.sitting,breaks:b.breaks}:Object.hasOwn(habitRules,habit)?{...a,[habit]:b[habit]}:a;
}
export function compareHabit(baseline,target,habit,days) {
  const a=normalizeProfile(baseline),b=isolateChange(a,target,habit);
  const horizon=[0,7,30,365].includes(days)?days:7;
  const rank={frequent:0,mixed:1,balanced:2};
  const changed=habit==='sitting'?a.sitting!==b.sitting||a.breaks!==b.breaks:a[habit]!==b[habit];
  const favorable=habit==='sleep'?b.sleep>a.sleep:habit==='activity'?b.activity>a.activity:habit==='diet'?rank[b.diet]>rank[a.diet]:b.sitting<=a.sitting&&(!a.breaks||b.breaks)&&(b.sitting<a.sitting||(!a.breaks&&b.breaks));
  const numeric=habit!=='diet';
  const rate=p=>habit==='activity'?p.activity/7:p[habit];
  const delta=numeric?(rate(b)-rate(a))*horizon:0;
  return {a,b,changed,favorable,horizon,numeric,delta:Math.round(delta*10)/10,totalA:numeric?rate(a)*horizon:0,totalB:numeric?rate(b)*horizon:0,unit:habit==='activity'?'分钟':'小时',quantity:habit==='sleep'?'累计睡眠机会':habit==='activity'?'累计中等强度活动':habit==='sitting'?'累计久坐时间':'饮食选择',formula:habit==='activity'?'每周活动分钟 ÷ 7 × 天数（按均匀安排估算）':habit==='sleep'?'每晚小时 × 天数（假设每天遵循输入）':habit==='sitting'?'每天久坐小时 × 天数（假设每天遵循输入）':'饮食场景没有摄入量数据，不绘制血糖或营养数量曲线'};
}
export function experimentGoals(baseline,target,habit) {
  const p=isolateChange(baseline,target,habit),goals=actionGoals(p);
  if(habit==='sleep')goals[0]={id:'sleep',icon:'moon',title:`今晚留出 ${p.sleep} 小时睡眠机会`,note:'按选定作息尝试，记录白天感受'};
  if(habit==='activity')goals[1]={id:'move',icon:'activity',title:`本周分次安排 ${p.activity} 分钟活动`,note:'每日打卡记录是否执行当日安排'};
  if(habit==='sitting')goals[1]={id:'move',icon:'activity',title:p.breaks?'学习工作间隙起身活动':`尝试将久坐控制在 ${p.sitting} 小时`,note:`所选场景：${p.sitting} 小时 / 天；用走动替代部分久坐`};
  if(habit==='diet')goals[2]={id:'diet',icon:'leaf',title:p.diet==='balanced'?'下一杯选水，下一餐增加蔬菜':'下一杯饮料选择水',note:'落实选定的饮食改变，不记录营养数值'};
  return goals;
}
