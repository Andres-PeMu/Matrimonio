create function public.save_wedding_settings(p_id uuid,p_wedding jsonb,p_settings jsonb) returns void language plpgsql security invoker set search_path='' as $$ begin
 if not public.can_manage(p_id) then raise exception 'FORBIDDEN'; end if;
 update public.weddings set bride_name=p_wedding->>'bride_name',groom_name=p_wedding->>'groom_name',title=p_wedding->>'title',description=p_wedding->>'description',wedding_date=(p_wedding->>'wedding_date')::timestamptz,rsvp_deadline=(p_wedding->>'rsvp_deadline')::timestamptz,timezone=p_wedding->>'timezone',status=p_wedding->>'status' where id=p_id;
 insert into public.wedding_settings(wedding_id) values(p_id) on conflict do nothing;
 update public.wedding_settings set envelope_message=p_settings->>'envelope_message',story=p_settings->>'story',dress_code=p_settings->>'dress_code',final_message=p_settings->>'final_message',show_story=(p_settings->>'show_story')::boolean,show_countdown=(p_settings->>'show_countdown')::boolean,show_gallery=(p_settings->>'show_gallery')::boolean,show_maps=(p_settings->>'show_maps')::boolean,show_dress_code=(p_settings->>'show_dress_code')::boolean,show_rsvp=(p_settings->>'show_rsvp')::boolean,show_music=(p_settings->>'show_music')::boolean,music_url=p_settings->>'music_url' where wedding_id=p_id;
 end $$;
revoke all on function public.save_wedding_settings(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.save_wedding_settings(uuid,jsonb,jsonb) to authenticated;
create function public.wedding_stats(p_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('invitations',count(*),'capacity',coalesce(sum(guest_limit),0),'confirmed',count(*) filter(where status='CONFIRMED'),'declined',count(*) filter(where status='DECLINED'),'pending',count(*) filter(where status='PENDING'),'attendees',(select coalesce(sum(attendees_count),0) from public.guest_confirmations where wedding_id=p_id)) from public.guests where wedding_id=p_id;
$$;
revoke all on function public.wedding_stats(uuid) from public,anon;
grant execute on function public.wedding_stats(uuid) to authenticated;
