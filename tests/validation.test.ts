import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateInvitationToken } from '../src/lib/tokens';
import {
  guestSchema,
  rsvpSchema,
  tokenSchema,
  validateRsvpLimit,
  eventSchema,
  settingsSchema,
} from '../src/lib/validations';
import { localDateTime, zonedToIso } from '../src/lib/dates';
test('tokens use 256 bits of entropy, URL-safe encoding and do not repeat', () => {
  const tokens = new Set(Array.from({ length: 1000 }, generateInvitationToken));
  assert.equal(tokens.size, 1000);
  for (const token of tokens) {
    assert.equal(token.length, 43);
    assert.ok(tokenSchema.safeParse(token).success);
  }
});
test('guest requires a name, valid email and bounded integer capacity', () => {
  assert.ok(
    guestSchema.safeParse({ name: 'Familia Peña', guest_limit: 4 }).success,
  );
  for (const value of [0, -1, 31, 1.5, 'bad'])
    assert.equal(
      guestSchema.safeParse({ name: 'Carlos', guest_limit: value }).success,
      false,
    );
  assert.equal(
    guestSchema.safeParse({ name: ' ', guest_limit: 4 }).success,
    false,
  );
  assert.equal(
    guestSchema.safeParse({ name: 'Carlos', guest_limit: 4, email: 'invalid' })
      .success,
    false,
  );
});
test('RSVP accepts a confirmation and a decline, rejects inconsistent names', () => {
  const token = generateInvitationToken();
  assert.ok(
    rsvpSchema.safeParse({
      token,
      status: 'CONFIRMED',
      names: ['Carlos', 'Laura'],
    }).success,
  );
  assert.ok(
    rsvpSchema.safeParse({ token, status: 'DECLINED', names: [] }).success,
  );
  for (const names of [[], [' '], Array(31).fill('Carlos')])
    assert.equal(
      rsvpSchema.safeParse({ token, status: 'CONFIRMED', names }).success,
      false,
    );
  assert.equal(
    rsvpSchema.safeParse({ token, status: 'DECLINED', names: ['Carlos'] })
      .success,
    false,
  );
});
test('tampered capacity is rejected', () => {
  assert.throws(() => validateRsvpLimit(20, 4), /cupos/);
  assert.doesNotThrow(() => validateRsvpLimit(4, 4));
});
test('short and invalid tokens are rejected before querying', () => {
  for (const token of ['1', 'abc', "' OR 1=1 --", 'a'.repeat(129)])
    assert.equal(tokenSchema.safeParse(token).success, false);
});
test('timezone date conversion keeps wedding local time', () => {
  assert.equal(
    zonedToIso('2027-11-16T16:00', 'America/Bogota'),
    '2027-11-16T21:00:00.000Z',
  );
  assert.equal(
    localDateTime('2027-11-16T21:00:00Z', 'America/Bogota'),
    '2027-11-16T16:00',
  );
  assert.equal(
    zonedToIso('2027-07-01T16:00', 'Europe/Madrid'),
    '2027-07-01T14:00:00.000Z',
  );
  assert.throws(() => zonedToIso('2027-03-14T02:30', 'America/New_York'));
});
test('events reject invalid dates and backwards times', () => {
  const input = {
    name: 'Ceremonia',
    type: 'CEREMONY',
    description: '',
    location_id: '',
    event_date: '2027-11-16',
    start_time: '16:00',
    end_time: '17:00',
    display_order: 0,
    is_active: true,
  };
  assert.ok(eventSchema.safeParse(input).success);
  assert.equal(
    eventSchema.safeParse({ ...input, event_date: '2027-02-30' }).success,
    false,
  );
  assert.equal(
    eventSchema.safeParse({ ...input, end_time: '15:00' }).success,
    false,
  );
});
test('music accepts HTTPS URLs or audio files from /music/', () => {
  const music = settingsSchema.shape.music_url;
  for (const value of [
    '',
    '/music/cancion.mp3',
    'https://music.youtube.com/watch?v=Wmko4BscPrU',
  ])
    assert.ok(music.safeParse(value).success, value);
  for (const value of [
    'http://example.com/a.mp3',
    '/music/../secret.mp3',
    '/music/cancion.exe',
    '/otra/cancion.mp3',
    'javascript:alert(1)',
  ])
    assert.equal(music.safeParse(value).success, false, value);
});
