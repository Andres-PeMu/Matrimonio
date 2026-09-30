-- Development data only. Map coordinates are approximate, adjust them from the admin panel.
insert into public.weddings(id,slug,bride_name,groom_name,title,description,wedding_date,rsvp_deadline,status) values
('11111111-1111-4111-8111-111111111111','astrid-andres','Astrid Meléndez','Andrés Peña','Nos casamos','La historia comienza cuando dos personas que ni soñaban conocerse terminan encontrándose en el instante menos esperado, pero en el momento indicado.','2026-11-07T16:00:00-05:00','2026-10-23T23:59:59-05:00','PUBLISHED') on conflict(id) do nothing;
insert into public.wedding_settings(wedding_id,story,dress_code) values('11111111-1111-4111-8111-111111111111','Hay encuentros que cambian la vida. El nuestro fue el comienzo de una historia llena de pequeñas aventuras, complicidad y amor. Hoy elegimos seguir escribiéndola juntos, rodeados de quienes más queremos.','Formal. Agradecemos reservar el blanco y beige para la novia.') on conflict(wedding_id) do nothing;
insert into public.guests(wedding_id,name,guest_limit,invitation_token) values
('11111111-1111-4111-8111-111111111111','Familia Peña',4,'dev-familia-pena-00000000000000000000000000000000'),
('11111111-1111-4111-8111-111111111111','Carlos Ramírez',2,'dev-carlos-ramirez-000000000000000000000000000000'),
('11111111-1111-4111-8111-111111111111','María López',1,'dev-maria-lopez-00000000000000000000000000000000') on conflict(invitation_token) do nothing;
insert into public.locations(id,wedding_id,name,address,city,state,country,latitude,longitude,description) values
('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Cristo Sacerdote','','El Bordo','Cauca','Colombia',2.1147,-76.9831,''),
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Rancho Grande','','El Bordo','Cauca','Colombia',2.1147,-76.9831,'') on conflict(id) do nothing;
insert into public.wedding_events(id,wedding_id,location_id,name,type,event_date,start_time,display_order) values
('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','Ceremonia','CEREMONY','2026-11-07','16:00',0),
('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Recepción','RECEPTION','2026-11-07','18:00',1) on conflict(id) do nothing;
