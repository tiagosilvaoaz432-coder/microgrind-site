/**
 * Confirms the site's copied numbers (lib/app-limits.mjs, lib/ga4.mjs) still match the app.
 * Run from the publish workflow with the app checkout:
 *   node scripts/check-app-parity.mjs <path-to-MicroGrind/appfiles>
 * Needs Node.js with TypeScript type stripping (22.18+ or 24).
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { EXAM_SIMULATIONS, MAP_CREDITS_PER_1000_CHARACTERS, PLAN_CREDITS } from '../lib/app-limits.mjs';
import { GA4_CONSENT_KEY, GA4_MEASUREMENT_ID_PRODUCTION, OAIQ_PIXEL_ID } from '../lib/ga4.mjs';
import { planCreditsFromMigrations } from './plan-credits.mjs';

const appRoot = process.argv[2];
if (!appRoot) {
  console.error('Usage: node scripts/check-app-parity.mjs <path-to-appfiles>');
  process.exit(2);
}
const load = (rel) => import(pathToFileURL(path.resolve(appRoot, rel)).href);

const exams = await load('supabase/functions/_shared/ai-exam/limits.ts');
const ga4 = await load('lib/ga4.ts');
const oaiq = await load('lib/oaiq.ts');

const migrationsDir = path.resolve(appRoot, 'supabase/migrations');
const migrations = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => ({ name, sql: readFileSync(path.join(migrationsDir, name), 'utf8') }));
assert.deepEqual(PLAN_CREDITS, planCreditsFromMigrations(migrations), 'AI credits per plan (public.plans.credit_quota)');

const uploadLimit = readFileSync(path.resolve(appRoot, 'lib/upload-limit.ts'), 'utf8');
const mapRate = uploadLimit.match(/export function mapCredits\([^)]*\)[^{]*\{[\s\S]*?Math\.ceil\(\(characters \* (\d+)\) \/ 1000\)/);
assert.ok(mapRate, 'mapCredits() not found in lib/upload-limit.ts');
assert.equal(MAP_CREDITS_PER_1000_CHARACTERS, Number(mapRate[1]), 'map credits per 1 000 characters');

assert.deepEqual(
  EXAM_SIMULATIONS,
  Object.fromEntries(Object.entries(exams.EXAM_SIMULATION_ALLOWANCE).map(([code, v]) => [code, v.simulations])),
  'exam simulations'
);
assert.equal(GA4_MEASUREMENT_ID_PRODUCTION, ga4.GA4_MEASUREMENT_ID_PRODUCTION, 'GA4 measurement ID');
assert.equal(GA4_CONSENT_KEY, ga4.GA4_CONSENT_KEY, 'consent key');
assert.equal(OAIQ_PIXEL_ID, oaiq.OAIQ_PIXEL_ID, 'OpenAI pixel ID');
console.log('Site numbers match the app.');
