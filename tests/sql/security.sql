\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.profiles(id,role,display_name) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ADMIN','Owner'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','ADMIN','Other');
insert into public.wedding_admins values('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
update public.weddings set rsvp_deadline=now()+interval '1 day' where id='11111111-1111-4111-8111-111111111111';
set local role anon;
do $$ begin
 begin perform * from public.guests; raise exception 'TEST: public guest access allowed'; exception when insufficient_privilege then null; end;
 begin perform public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','CONFIRMED',array['A'],'');raise exception 'TEST: anon RPC allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$ begin if exists(select 1 from public.guests) then raise exception 'TEST: cross-wedding read';end if;
 begin insert into public.guests(wedding_id,name,guest_limit) values('11111111-1111-4111-8111-111111111111','Intruder',1);raise exception 'TEST: cross-wedding write';exception when insufficient_privilege then null;end;
 begin update public.profiles set role='SUPER_ADMIN';raise exception 'TEST: privilege escalation';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin if (select count(*) from public.guests)<>3 then raise exception 'TEST: owner cannot read';end if; end $$;
insert into public.guests(wedding_id,name,guest_limit) values('11111111-1111-4111-8111-111111111111','New guest',2);
reset role;
set local role service_role;
select public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','CONFIRMED',array['Carlos','Laura','Sofía'],'Nos vemos');
select public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','CONFIRMED',array['Carlos','Laura'],'Actualizado');
do $$ declare token text='dev-familia-pena-00000000000000000000000000000000';begin
 if (select count(*) from public.guest_confirmations)<>1 then raise exception 'TEST: duplicate confirmation';end if;
 if (select count(*) from public.attendees)<>2 then raise exception 'TEST: attendees not replaced';end if;
 if (select status from public.guests where invitation_token=token)<>'CONFIRMED' then raise exception 'TEST: status not synced';end if;
 begin perform public.submit_rsvp(token,'CONFIRMED',array['A','B','C','D','E'],'');raise exception 'TEST: exceeded limit';exception when raise_exception then if sqlerrm<>'INVALID_ATTENDEES' then raise;end if;end;
 begin perform public.submit_rsvp('does-not-exist','CONFIRMED',array['A'],'');raise exception 'TEST: invalid token accepted';exception when raise_exception then if sqlerrm<>'INVITATION_NOT_FOUND' then raise;end if;end;
 begin update public.guests set guest_limit=1 where invitation_token=token;raise exception 'TEST: limit below confirmation';exception when raise_exception then if sqlerrm<>'LIMIT_BELOW_CONFIRMED' then raise;end if;end;
end $$;
select public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','DECLINED',array[]::text[],'');
do $$ begin if exists(select 1 from public.attendees) then raise exception 'TEST: declined attendees remain';end if;end $$;
update public.weddings set rsvp_deadline=now()-interval '1 second';
select public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','CONFIRMED',array['Nombre alterado'],'');
do $$ begin
 if not exists(select 1 from public.guest_confirmations c join public.weddings w on w.id=c.wedding_id where c.confirmed_at>w.rsvp_deadline) then raise exception 'TEST: late answer rejected';end if;
 if exists(select 1 from public.attendees where is_primary_guest and name='Nombre alterado') then raise exception 'TEST: primary guest renamed';end if;
end $$;
update public.guests set invitation_token=encode(extensions.gen_random_bytes(32),'hex') where invitation_token='dev-familia-pena-00000000000000000000000000000000';
do $$ begin
 begin perform public.submit_rsvp('dev-familia-pena-00000000000000000000000000000000','CONFIRMED',array['A'],'');raise exception 'TEST: revoked accepted';exception when raise_exception then if sqlerrm<>'INVITATION_NOT_FOUND' then raise;end if;end;
end $$;
reset role;
rollback;
\echo 'SQL security and RSVP tests passed'
