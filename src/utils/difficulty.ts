/**
 * Difficulty setting (easy / normal / hard) from Parent Dashboard.
 * Games use this to scale: correct needed, choices count, question complexity, time, etc.
 */
import { getSetting } from '../database/db';

export type Difficulty = 'easy' | 'normal' | 'hard';

export function getDifficulty(): Difficulty {
  const v = getSetting('difficulty');
  if (v === 'easy' || v === 'normal' || v === 'hard') return v;
  return 'normal';
}

/** For "correct needed to level up": easy = fewer, normal = base, hard = more. */
export function scaleNeeded(base: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.max(1, base - 1);
  if (difficulty === 'hard') return base + 1;
  return base;
}

/** For "number of choices / options": easy = fewer, normal = base, hard = more (cap at max). */
export function scaleChoices(base: number, max: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.max(2, Math.min(base - 1, max));
  if (difficulty === 'hard') return Math.min(base + 1, max);
  return Math.min(base, max);
}

/** For "effective level" used in content (e.g. math range): easy = lower, hard = higher. */
export function scaleLevel(level: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.max(1, level - 1);
  if (difficulty === 'hard') return level + 1;
  return level;
}

/** For max value (e.g. max numbers in sequence): easy = lower cap, hard = higher cap. */
export function scaleMax(base: number, difficulty: Difficulty): number {
  if (difficulty === 'easy') return Math.max(2, base - 2);
  if (difficulty === 'hard') return base + 1;
  return base;
}
