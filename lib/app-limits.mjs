/**
 * Plan numbers the pricing page must match. Copied from the MicroGrind app repo:
 *   PLAN_CREDITS                       ← public.plans.credit_quota (latest value set in appfiles/supabase/migrations)
 *   MAP_CREDITS_PER_1000_CHARACTERS    ← mapCredits() in appfiles/lib/upload-limit.ts
 *   EXAM_SIMULATIONS[*]                ← EXAM_SIMULATION_ALLOWANCE in appfiles/supabase/functions/_shared/ai-exam/limits.ts
 * scripts/check-app-parity.mjs compares them with the app before every publish.
 */
export const PLAN_CREDITS = { free: 1000, plus: 2000, pro: 4000, ultra: 10_000, season: 6000 };

export const MAP_CREDITS_PER_1000_CHARACTERS = 6;

export const EXAM_SIMULATIONS = { free: 0, plus: 3, pro: 10, ultra: 15, season: 20 };
