import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planCreditsFromMigrations } from './plan-credits.mjs';

test('reads the case form and lets later migrations win', () => {
  const credits = planCreditsFromMigrations([
    {
      name: '1_credits.sql',
      sql: `-- comment: set credit_quota = 5 where code = 'free'
update public.plans
set credit_quota = case code
  when 'free' then 1000
  when 'plus' then 2000
  else coalesce(credit_quota, 1000)
end;`,
    },
    { name: '2_more.sql', sql: "update public.plans set credit_quota = 2500, updated_at = now() where code = 'plus';" },
  ]);
  assert.deepEqual(credits, { free: 1000, plus: 2500 });
});

test('ignores other tables and fails when nothing is found', () => {
  assert.throws(() => planCreditsFromMigrations([{ name: 'x.sql', sql: "update public.other set credit_quota = 1 where code = 'free';" }]));
});
