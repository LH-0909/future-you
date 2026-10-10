import { DEFAULT_PROFILE, normalizeProfile, planDates } from './engine.js';
import { isolateChange, habitRules } from './experiment.js';
const KEY = 'future-you:v1';
export function loadState(storage) {
  try {
    storage ||= globalThis.localStorage;
    const raw = JSON.parse(storage.getItem(KEY));
    if (raw?.version !== 1) return null;
    const plan = raw.plan && /^\d{4}-\d{2}-\d{2}$/.test(raw.plan.start) && planDates(raw.plan.start).length === 7 && Array.isArray(raw.plan.goals) && raw.plan.goals.length === 3 && new Set(raw.plan.goals.map(g=>g?.id)).size === 3 && raw.plan.goals.every(g => g && ['sleep','move','diet'].includes(g.id) && typeof g.title === 'string' && g.title.length <= 80 && typeof g.note === 'string' && g.note.length <= 200 && ['moon','activity','leaf'].includes(g.icon)) ? raw.plan : null;
    const dates = plan ? planDates(plan.start) : [];
    const run = raw.run && Object.hasOwn(habitRules,raw.run.habit) && [0,1,2].includes(raw.run.step) && [0,7,30,365].includes(raw.run.days) ? { baseline:normalizeProfile(raw.run.baseline), target:isolateChange(raw.run.baseline,raw.run.target,raw.run.habit), habit:raw.run.habit, step:raw.run.step, days:raw.run.days } : null;
    return { profile: normalizeProfile(raw.profile), run, settings: { lowPower: raw.settings?.lowPower === true, reduced: raw.settings?.reduced === true }, plan: plan ? { start: plan.start, goals: plan.goals, checks: Object.fromEntries(Object.entries(plan.checks || {}).filter(([k,v]) => dates.includes(k.split(':')[0]) && /^\d{4}-\d{2}-\d{2}:(sleep|move|diet)$/.test(k) && v === true)) } : null };
  } catch { return null; }
}
export function saveState(state, storage) {
  try { storage ||= globalThis.localStorage; storage.setItem(KEY, JSON.stringify({ version: 1, ...state, profile: normalizeProfile(state.profile || DEFAULT_PROFILE) })); return true; } catch { return false; }
}
export function clearState(storage) {
  try { storage ||= globalThis.localStorage; storage.removeItem(KEY); return true; } catch { return false; }
}
