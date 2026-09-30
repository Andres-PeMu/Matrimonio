-- Late answers are accepted and flagged in the admin panel (confirmed_at > rsvp_deadline).
-- The primary attendee is always the invited guest; the invitation name cannot be edited.
create or replace function public.submit_rsvp(p_token text, p_status text, p_names text[], p_message text default '') returns uuid language plpgsql security definer set search_path='' as $$
 declare g public.guests; w public.weddings; cid uuid; n integer; begin
 select * into g from public.guests where invitation_token=p_token for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 select * into w from public.weddings where id=g.wedding_id for share;
 if w.status<>'PUBLISHED' then raise exception 'INVITATION_NOT_FOUND'; end if;
 if not exists(select 1 from public.wedding_settings where wedding_id=w.id and show_rsvp) then raise exception 'RSVP_DISABLED'; end if;
 n=coalesce(cardinality(p_names),0);
 if p_status not in ('CONFIRMED','DECLINED') or p_status is null or n>g.guest_limit or (p_status='CONFIRMED' and n<1) or (p_status='DECLINED' and n<>0) then raise exception 'INVALID_ATTENDEES'; end if;
 if p_status='CONFIRMED' then p_names[1]=g.name; end if;
 if length(coalesce(p_message,''))>2000 or exists(select 1 from unnest(p_names) as x where x is null or length(btrim(x)) not between 1 and 150) then raise exception 'INVALID_INPUT'; end if;
 insert into public.guest_confirmations(wedding_id,guest_id,status,attendees_count,message) values(g.wedding_id,g.id,p_status,n,p_message)
 on conflict(guest_id) do update set status=excluded.status,attendees_count=excluded.attendees_count,message=excluded.message,confirmed_at=now() returning id into cid;
 delete from public.attendees where confirmation_id=cid;
 insert into public.attendees(wedding_id,confirmation_id,name,is_primary_guest,display_order) select g.wedding_id,cid,btrim(x),ord=1,(ord-1)::integer from unnest(p_names) with ordinality as a(x,ord);
 update public.guests set status=p_status where id=g.id;
 return cid;
 end $$;
revoke all on function public.submit_rsvp(text,text,text[],text) from public, anon, authenticated;
grant execute on function public.submit_rsvp(text,text,text[],text) to service_role;
