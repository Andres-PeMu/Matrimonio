import { execFileSync } from 'node:child_process';
const vars = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
);
const url = vars.DB_URL;
if (!url || !/^postgresql:\/\/[^@]+@(127\.0\.0\.1|localhost):54322\//.test(url))
  throw new Error('La prueba SQL requiere Supabase local en el puerto 54322.');
execFileSync(
  'psql',
  [url, '-v', 'ON_ERROR_STOP=1', '-f', 'tests/sql/security.sql'],
  { stdio: 'inherit' },
);
