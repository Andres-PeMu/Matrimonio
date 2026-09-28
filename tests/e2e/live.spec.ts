import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
const enabled =
  process.env.TEST_SUPABASE_ALLOW_MUTATIONS === '1' &&
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
test('real admin → guest → personalized envelope → RSVP → database → dashboard', async ({
  page,
  context,
}) => {
  test.skip(
    !enabled,
    'Requires a disposable Supabase project and TEST_SUPABASE_ALLOW_MUTATIONS=1.',
  );
  test.setTimeout(180000);
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const id = randomUUID();
  const email = `test-${id}@example.com`;
  const password = `Test-${randomUUID()}!`;
  let userId = '';
  const check = (error: unknown) => {
    if (error) throw error;
  };
  try {
    const { data: user, error: ue } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    check(ue);
    userId = user.user!.id;
    check(
      (
        await db
          .from('profiles')
          .insert({ id: userId, role: 'ADMIN', display_name: 'Prueba' })
      ).error,
    );
    check(
      (
        await db.from('weddings').insert({
          id,
          slug: `test-${id}`,
          bride_name: 'Astrid Prueba',
          groom_name: 'Andrés Prueba',
          title: 'Nuestra boda',
          description: 'Una invitación especial',
          wedding_date: '2035-11-16T21:00:00Z',
          rsvp_deadline: '2035-11-01T23:59:59Z',
          status: 'PUBLISHED',
        })
      ).error,
    );
    check(
      (
        await db
          .from('wedding_admins')
          .insert({ wedding_id: id, user_id: userId })
      ).error,
    );
    check(
      (
        await db.from('wedding_settings').insert({
          wedding_id: id,
          story: 'Nuestra historia.',
          dress_code: 'Formal',
        })
      ).error,
    );
    await page.goto('/admin/login');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Entrar al panel' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/admin/locations');
    await page.getByRole('button', { name: 'Agregar lugar' }).click();
    await page.getByLabel('Nombre *', { exact: true }).fill('Jardín de prueba');
    await page.getByLabel('Dirección', { exact: true }).fill('Calle 10');
    await page.getByLabel('Ciudad *').fill('Cali');
    const map = page.getByRole('region', {
      name: 'Mapa para seleccionar ubicación; también puedes escribir las coordenadas.',
    });
    await expect(map.locator('.leaflet-marker-icon')).toBeVisible();
    await map.click({ position: { x: 160, y: 120 } });
    const latitude = await page
      .getByLabel('Latitud', { exact: true })
      .inputValue();
    expect(Number(latitude)).not.toBe(3.4516);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(
      page.getByRole('cell', { name: 'Jardín de prueba', exact: true }),
    ).toBeVisible();
    const { data: location } = await db
      .from('locations')
      .select('latitude')
      .eq('wedding_id', id)
      .single();
    expect(location!.latitude).toBe(Number(latitude));
    await page.goto('/admin/events');
    await page.getByRole('button', { name: 'Agregar evento' }).click();
    await page
      .getByLabel('Nombre *', { exact: true })
      .fill('Ceremonia de prueba');
    await page
      .getByLabel('Lugar', { exact: true })
      .selectOption({ label: 'Jardín de prueba' });
    await page.getByLabel('Fecha *', { exact: true }).fill('2035-11-16');
    await page.getByLabel('Hora de inicio').fill('16:00');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(
      page.getByRole('cell', { name: 'Ceremonia de prueba', exact: true }),
    ).toBeVisible();
    await page.goto('/admin/gallery');
    await page
      .getByLabel('Fotografía', { exact: true })
      .setInputFiles('public/floral-paper.webp');
    await page.getByLabel('Descripción accesible').fill('Flores de prueba');
    await page.getByRole('button', { name: 'Subir fotografía' }).click();
    await expect(page.getByRole('status')).toHaveText('Fotografía subida.');
    await expect(page.getByAltText('Flores de prueba')).toBeVisible();
    expect(
      await page
        .getByAltText('Flores de prueba')
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0);
    await page.goto('/admin/settings');
    await page
      .getByLabel('Mensaje principal')
      .fill('Nos hace felices celebrar contigo.');
    await page.getByRole('button', { name: 'Guardar configuración' }).click();
    await expect(page.getByRole('status')).toHaveText(
      'Configuración guardada.',
    );
    await page.goto('/admin/guests');
    await page.getByRole('button', { name: 'Agregar invitado' }).click();
    await page
      .getByLabel('Nombre *', { exact: true })
      .fill('Familia de prueba');
    await page.getByLabel('Cupos totales').fill('4');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    const link = page.getByRole('link', {
      name: 'Abrir invitación ↗',
      exact: true,
    });
    await expect(link).toBeVisible();
    const url = (await link.getAttribute('href'))!;
    const guest = await context.newPage();
    await guest.setViewportSize({ width: 390, height: 844 });
    await guest.goto(url);
    await guest.screenshot({
      path: 'test-results/envelope-mobile.png',
      fullPage: true,
    });
    await guest.getByRole('button', { name: 'Abrir mi invitación' }).click();
    await expect(
      guest.getByRole('heading', { name: 'Familia de prueba' }),
    ).toBeVisible();
    await guest.getByRole('button', { name: 'DESCUBRIR INVITACIÓN' }).click();
    await expect(
      guest.getByText('Nos hace felices celebrar contigo.'),
    ).toBeVisible();
    await expect(
      guest.getByRole('heading', { name: 'Ceremonia de prueba' }),
    ).toBeVisible();
    await guest.getByText('Ver mapa', { exact: true }).click();
    await expect(guest.locator('.leaflet-marker-icon')).toBeVisible();
    await expect(
      guest.getByRole('link', { name: 'Cómo llegar' }),
    ).toHaveAttribute('href', new RegExp(latitude));
    await expect(guest.getByAltText('Flores de prueba')).toBeVisible();
    await guest.getByLabel('¿Cuántas personas asistirán?').selectOption('3');
    for (const [i, name] of ['Carlos', 'Laura', 'Sofía'].entries())
      await guest.getByLabel(`Nombre del asistente ${i + 1}`).fill(name);
    await guest
      .getByRole('button', { name: 'Confirmar asistencia', exact: false })
      .click();
    await expect(guest.getByRole('status')).toContainText(
      'Tu asistencia está confirmada',
    );
    const { data: g } = await db
      .from('guests')
      .select('id,invitation_token')
      .eq('wedding_id', id)
      .single();
    const { data: c } = await db
      .from('guest_confirmations')
      .select('attendees_count,attendees(name)')
      .eq('guest_id', g!.id)
      .single();
    expect(c!.attendees_count).toBe(3);
    expect(c!.attendees).toHaveLength(3);
    const tampered = await guest.request.post('/api/rsvp', {
      headers: { Origin: 'http://127.0.0.1:3100' },
      data: {
        token: g!.invitation_token,
        status: 'CONFIRMED',
        names: Array(20).fill('Extra'),
        message: '',
      },
    });
    expect(tampered.status()).toBe(400);
    await guest.reload();
    await guest.getByRole('button', { name: 'Abrir mi invitación' }).click();
    await guest.getByRole('button', { name: 'DESCUBRIR INVITACIÓN' }).click();
    await expect(guest.getByLabel('Nombre del asistente 3')).toHaveValue(
      'Sofía',
    );
    await guest.screenshot({
      path: 'test-results/invitation-mobile.png',
      fullPage: true,
    });
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      await guest.setViewportSize({ width, height: 900 });
      expect(
        await guest.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await guest.screenshot({
      path: 'test-results/invitation-desktop.png',
      fullPage: true,
    });
    await page.goto('/admin/dashboard');
    await page.screenshot({
      path: 'test-results/dashboard-desktop.png',
      fullPage: true,
    });
    await expect(
      page
        .locator('.stat-card')
        .filter({ hasText: 'Personas confirmadas' })
        .locator('strong'),
    ).toHaveText('3');
    await guest.getByLabel('¿Cuántas personas asistirán?').selectOption('2');
    await guest.getByRole('button', { name: 'Guardar mi respuesta' }).click();
    await expect(guest.getByRole('status')).toContainText(
      'Tu asistencia está confirmada',
    );
    expect(
      (
        await db
          .from('guest_confirmations')
          .select('attendees_count')
          .eq('guest_id', g!.id)
          .single()
      ).data?.attendees_count,
    ).toBe(2);
    check(
      (
        await db
          .from('weddings')
          .update({ rsvp_deadline: '2000-01-01T00:00:00Z' })
          .eq('id', id)
      ).error,
    );
    const expired = await guest.request.post('/api/rsvp', {
      headers: { Origin: 'http://127.0.0.1:3100' },
      data: {
        token: g!.invitation_token,
        status: 'CONFIRMED',
        names: ['Carlos'],
        message: '',
      },
    });
    expect(expired.status()).toBe(400);
    expect((await expired.json()).message).toContain('finalizado');
    await page.goto('/admin/guests');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTitle('Regenerar enlace').click();
    await expect(page.getByRole('status')).toContainText('dejó de funcionar');
    await guest.goto(url);
    await expect(
      guest.getByRole('heading', { name: 'Invitación no encontrada' }),
    ).toBeVisible();
  } finally {
    const { data: photos } = await db
      .from('wedding_media')
      .select('storage_path')
      .eq('wedding_id', id);
    if (photos?.length)
      check(
        (
          await db.storage
            .from('wedding-media')
            .remove(photos.map((m) => m.storage_path))
        ).error,
      );
    for (const table of [
      'guests',
      'wedding_events',
      'locations',
      'wedding_media',
      'wedding_settings',
      'wedding_admins',
    ])
      check((await db.from(table).delete().eq('wedding_id', id)).error);
    check((await db.from('weddings').delete().eq('id', id)).error);
    if (userId) check((await db.auth.admin.deleteUser(userId)).error);
  }
});
