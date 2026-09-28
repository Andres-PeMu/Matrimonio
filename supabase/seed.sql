-- Development data only. Dates and venues are examples, edit before publishing.
insert into public.weddings(id,slug,bride_name,groom_name,title,description,wedding_date,rsvp_deadline,status) values
('11111111-1111-4111-8111-111111111111','astrid-andres','Astrid Meléndez','Andrés Peña','Nos casamos','Dos caminos, un mismo destino. Queremos compartir este día tan especial contigo.','2027-11-16T16:00:00-05:00','2027-11-01T23:59:59-05:00','PUBLISHED') on conflict(id) do nothing;
insert into public.wedding_settings(wedding_id,story,dress_code) values('11111111-1111-4111-8111-111111111111','Hay encuentros que cambian la vida. El nuestro fue el comienzo de una historia llena de pequeñas aventuras, complicidad y amor. Hoy elegimos seguir escribiéndola juntos, rodeados de quienes más queremos.','Formal. Agradecemos reservar el blanco para la novia.') on conflict(wedding_id) do nothing;
insert into public.guests(wedding_id,name,guest_limit,invitation_token) values
('11111111-1111-4111-8111-111111111111','Familia Peña',4,'dev-familia-pena-00000000000000000000000000000000'),
('11111111-1111-4111-8111-111111111111','Carlos Ramírez',2,'dev-carlos-ramirez-000000000000000000000000000000'),
('11111111-1111-4111-8111-111111111111','María López',1,'dev-maria-lopez-00000000000000000000000000000000') on conflict(invitation_token) do nothing;
insert into public.locations(id,wedding_id,name,address,city,country,latitude,longitude,description) values
('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','Lugar de la ceremonia (ejemplo)','Dirección por confirmar','Cali','Colombia',3.4516,-76.532,'Ubicación de desarrollo. Reemplazar por el lugar real.'),
('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Lugar de la recepción (ejemplo)','Dirección por confirmar','Cali','Colombia',3.4400,-76.5400,'Ubicación de desarrollo. Reemplazar por el lugar real.') on conflict(id) do nothing;
insert into public.wedding_events(id,wedding_id,location_id,name,type,event_date,start_time,display_order) values
('44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','Ceremonia','CEREMONY','2027-11-16','16:00',0),
('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Recepción','RECEPTION','2027-11-16','18:00',1) on conflict(id) do nothing;
