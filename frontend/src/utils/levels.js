// Single source of truth for the 4 course difficulty tiers.
// Keep the `value`s in sync with backend/src/models/Course.js (COURSE_LEVELS).

export const LEVELS = [
  { value: 'apprentice',         label: 'Apprentice',         icon: '🟢', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', chip: 'bg-emerald-500 text-white', bar: 'from-emerald-500 to-emerald-600' },
  { value: 'adept', label: 'Adept', icon: '🟡', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       chip: 'bg-amber-500 text-white',   bar: 'from-amber-500 to-amber-600' },
  { value: 'master',     label: 'Master',     icon: '🟠', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',   chip: 'bg-orange-500 text-white',  bar: 'from-orange-500 to-orange-600' },
  { value: 'legend',          label: 'Legend',     icon: '🔴', badge: 'bg-red-500/15 text-red-400 border-red-500/30',           chip: 'bg-red-500 text-white',     bar: 'from-red-500 to-red-600' },
]

export const LEVEL_MAP = LEVELS.reduce((acc, l) => { acc[l.value] = l; return acc }, {})

export function getLevel(value) {
  return LEVEL_MAP[value] || LEVELS[0]
}
