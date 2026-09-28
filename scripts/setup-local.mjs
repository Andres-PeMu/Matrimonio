import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const vars = JSON.parse(
  execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
);
const url = vars.API_URL;
if (!url || !/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(url))
  throw new Error(
    'Este script solo configura Supabase local en el puerto 54321.',
  );
if (existsSync('.env.local')) {
  const old = readFileSync('.env.local', 'utf8');
  const line = old.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
  if (
    line?.[1] &&
    !line[1].includes('127.0.0.1:54321') &&
    !line[1].includes('localhost:54321')
  )
    throw new Error(
      'Ya existe una configuración remota. No se sobrescribirá .env.local.',
    );
}
const db = createClient(url, vars.SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const email = 'admin@boda.local';
let password = randomBytes(18).toString('base64url');
if (existsSync('.local-admin.txt')) {
  const match = readFileSync('.local-admin.txt', 'utf8').match(
    /^Contraseña: (.+)$/m,
  );
  if (match) password = match[1];
}
const { data: users, error: listError } = await db.auth.admin.listUsers();
if (listError) throw listError;
let user = users.users.find((u) => u.email === email);
if (!user) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
} else {
  const { error } = await db.auth.admin.updateUserById(user.id, { password });
  if (error) throw error;
}
const check = (result) => {
  if (result.error) throw result.error;
};
check(
  await db
    .from('profiles')
    .upsert({ id: user.id, role: 'ADMIN', display_name: 'Astrid y Andrés' }),
);
check(
  await db
    .from('wedding_admins')
    .upsert({
      wedding_id: '11111111-1111-4111-8111-111111111111',
      user_id: user.id,
    }),
);
writeFileSync(
  '.env.local',
  `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${vars.ANON_KEY}\nSUPABASE_SERVICE_ROLE_KEY=${vars.SERVICE_ROLE_KEY}\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\nWEDDING_SLUG=astrid-andres\n`,
  { mode: 0o600 },
);
writeFileSync(
  '.local-admin.txt',
  `Solo para desarrollo local. No usar en producción.\nPanel: http://localhost:3000/admin/login\nEmail: ${email}\nContraseña: ${password}\n`,
  { mode: 0o600 },
);
console.log(
  'Supabase local conectado. Credenciales del administrador guardadas en .local-admin.txt.',
);
