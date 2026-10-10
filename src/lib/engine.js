export const DEFAULT_PROFILE = { sleep: 6.5, activity: 90, sitting: 8, diet: 'mixed', breaks: false };
export const DEMO_PROFILES = {
  student: { sleep: 6, activity: 60, sitting: 9, diet: 'frequent', breaks: false },
  active: { sleep: 7.5, activity: 180, sitting: 6, diet: 'balanced', breaks: true },
};
const bound = (value, min, max, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
export function normalizeProfile(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  return {
    sleep: Math.round(bound(raw.sleep, 4, 9, DEFAULT_PROFILE.sleep) * 2) / 2,
    activity: Math.round(bound(raw.activity, 0, 420, DEFAULT_PROFILE.activity) / 10) * 10,
    sitting: Math.round(bound(raw.sitting, 0, 14, DEFAULT_PROFILE.sitting) * 2) / 2,
    diet: ['frequent', 'mixed', 'balanced'].includes(raw.diet) ? raw.diet : DEFAULT_PROFILE.diet,
    breaks: raw.breaks === true,
  };
}
export function evaluateProfile(raw) {
  const p = normalizeProfile(raw);
  return {
    sleep: { attention: p.sleep < 7, label: p.sleep < 7 ? '留出更多睡眠时间' : '保持规律与质量', detail: p.sleep < 7 ? '输入时长低于成年人通常建议的至少 7 小时。' : '达到一般时长建议，继续关注质量与规律性。' },
    activity: { attention: p.activity < 150, label: p.activity < 150 ? '逐步增加活动' : '保持活动与肌力练习', detail: p.activity < 150 ? '可从少量活动开始，逐步接近每周推荐量。' : '已达到中等强度有氧活动的一般最低推荐量。' },
    diet: { attention: p.diet !== 'balanced', label: p.diet === 'frequent' ? '从水替代甜饮开始' : p.diet === 'mixed' ? '让饮食更多样' : '保持多样化搭配', detail: p.diet === 'balanced' ? '多样化饮食、少盐和减少游离糖是长期方向。' : '饮食场景不能测算营养摄入；可以先做一项可行调整。' },
    sitting: { attention: !p.breaks && p.sitting > 0, label: p.sitting === 0 ? '保持日常活动' : p.breaks ? '保留活动间歇' : '安排活动间歇', detail: '久坐时长仅用于场景描述，不能判定个人风险或安全范围。' },
  };
}
export function improvedProfile(raw) {
  const p = normalizeProfile(raw);
  return normalizeProfile({ ...p, sleep: Math.max(p.sleep, 7.5), activity: Math.max(p.activity, 150), sitting: Math.max(0, p.sitting - 1), breaks: true, diet: 'balanced' });
}
export function scenarioAt(profile, stage, branch = 'keep') {
  // Time is a narrative chapter, never a numerical physiological multiplier.
  const index = Number.isInteger(stage) ? Math.max(0, Math.min(3, stage)) : 0;
  const effective = branch === 'improve' && index > 0 ? improvedProfile(profile) : normalizeProfile(profile);
  return { profile: effective, states: evaluateProfile(effective), stage: index, branch };
}
export function actionGoals(raw) {
  const p = normalizeProfile(raw);
  return [
    { id: 'sleep', title: p.sleep < 7 ? '为睡眠多留 30 分钟' : '保持规律的起床时间', note: '给自己足够的睡眠机会', icon: 'moon' },
    { id: 'move', title: '安排 10 分钟快走', note: p.breaks ? '保持活动间歇，循序渐进' : '学习或工作间隙起身活动', icon: 'activity' },
    { id: 'diet', title: p.diet === 'balanced' ? '下一餐搭配一种蔬菜' : '下一杯饮料选择水', note: '从一项可行的选择开始', icon: 'leaf' },
  ];
}
export function dateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function planDates(start) {
  const base = new Date(`${start}T12:00:00+08:00`);
  if (!Number.isFinite(base.getTime()) || dateKey(base) !== start) return [];
  return Array.from({ length: 7 }, (_, i) => dateKey(new Date(base.getTime() + i * 86400000)));
}
