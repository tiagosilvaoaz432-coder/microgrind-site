/**
 * Plan numbers the pricing page must match. Copied from the MicroGrind app repo:
 *   TUTOR_AVERAGE_MESSAGE_TOKENS, TUTOR_PLAN_TOKEN_WINDOWS  ← appfiles/lib/tutor-message-budget.ts
 *   EXAM_SIMULATION_ALLOWANCE[*].simulations               ← appfiles/supabase/functions/_shared/ai-exam/limits.ts
 * scripts/check-app-parity.mjs compares them with the app before every publish.
 */
export const TUTOR_AVERAGE_MESSAGE_TOKENS = 14_502;

export const TUTOR_PLAN_TOKEN_WINDOWS = {
  free: 95_310,
  plus: 635_400,
  pro: 1_270_800,
  ultra: 3_177_000,
  season: 1_270_800,
};

export const EXAM_SIMULATIONS = { free: 0, plus: 3, pro: 10, ultra: 15, season: 20 };
