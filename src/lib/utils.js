import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ── Grade helpers ── */
export const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
export const gradePoint = (g) => GRADE_POINTS[(g ?? '').toUpperCase()] ?? 0;

export const gradeColor = (g) => {
  const map = {
    A: '#22c55e',
    B: '#6366f1',
    C: '#f59e0b',
    D: '#f97316',
    E: '#ef4444',
    F: '#ef4444',
  };
  return map[(g ?? '').toUpperCase()] ?? '#94a3b8';
};
