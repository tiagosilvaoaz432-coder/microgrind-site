/**
 * Reads public.plans.credit_quota from the app's SQL migrations, in file order (the last value set wins).
 * Understands the two forms the app uses:
 *   update public.plans set credit_quota = case code when 'free' then 1000 ... end;
 *   update public.plans set credit_quota = 1500 where code = 'free';
 */
export function planCreditsFromMigrations(migrations) {
  const credits = {};
  for (const { sql } of migrations) {
    const text = sql.replace(/--[^\n]*/g, '');
    for (const statement of text.split(';')) {
      if (!/update\s+(public\.)?plans\b/i.test(statement) || !/set\s+credit_quota\s*=/i.test(statement)) continue;
      const caseBlock = statement.match(/credit_quota\s*=\s*case\s+code([\s\S]*?)\bend\b/i);
      if (caseBlock) {
        for (const [, code, value] of caseBlock[1].matchAll(/when\s+'(\w+)'\s+then\s+(\d+)/gi)) credits[code] = Number(value);
        continue;
      }
      const single = statement.match(/credit_quota\s*=\s*(\d+)[\s\S]*?where\s+code\s*=\s*'(\w+)'/i);
      if (single) credits[single[2]] = Number(single[1]);
    }
  }
  if (Object.keys(credits).length === 0) throw new Error('No credit_quota found in the app migrations');
  return credits;
}
