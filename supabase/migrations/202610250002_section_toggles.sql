alter table public.wedding_settings
  add column show_hero boolean not null default true,
  add column show_events boolean not null default true,
  add column show_footer boolean not null default true;

create or replace function public.save_wedding_settings(p_id uuid,p_wedding jsonb,p_settings jsonb) returns void language plpgsql security invoker set search_path='' as $$ begin
 if not public.can_manage(p_id) then raise exception 'FORBIDDEN'; end if;
 update public.weddings set bride_name=p_wedding->>'bride_name',groom_name=p_wedding->>'groom_name',title=p_wedding->>'title',description=p_wedding->>'description',wedding_date=(p_wedding->>'wedding_date')::timestamptz,rsvp_deadline=(p_wedding->>'rsvp_deadline')::timestamptz,timezone=p_wedding->>'timezone',status=p_wedding->>'status' where id=p_id;
 insert into public.wedding_settings(wedding_id) values(p_id) on conflict do nothing;
 update public.wedding_settings set envelope_message=p_settings->>'envelope_message',story=p_settings->>'story',dress_code=p_settings->>'dress_code',final_message=p_settings->>'final_message',show_story=(p_settings->>'show_story')::boolean,show_countdown=(p_settings->>'show_countdown')::boolean,show_gallery=(p_settings->>'show_gallery')::boolean,show_maps=(p_settings->>'show_maps')::boolean,show_dress_code=(p_settings->>'show_dress_code')::boolean,show_rsvp=(p_settings->>'show_rsvp')::boolean,show_music=(p_settings->>'show_music')::boolean,music_url=p_settings->>'music_url',
  dress_code_eyebrow=coalesce(p_settings->>'dress_code_eyebrow',dress_code_eyebrow),dress_code_title=coalesce(p_settings->>'dress_code_title',dress_code_title),dress_code_note=coalesce(p_settings->>'dress_code_note',dress_code_note),show_dress_code_colors=coalesce((p_settings->>'show_dress_code_colors')::boolean,show_dress_code_colors),dress_code_colors=coalesce(p_settings->'dress_code_colors',dress_code_colors),
  show_envelope_rain=coalesce((p_settings->>'show_envelope_rain')::boolean,show_envelope_rain),envelope_rain_eyebrow=coalesce(p_settings->>'envelope_rain_eyebrow',envelope_rain_eyebrow),envelope_rain_title=coalesce(p_settings->>'envelope_rain_title',envelope_rain_title),envelope_rain_note=coalesce(p_settings->>'envelope_rain_note',envelope_rain_note),
  invitation_style=coalesce(p_settings->>'invitation_style',invitation_style),
  show_hero=coalesce((p_settings->>'show_hero')::boolean,show_hero),
  show_events=coalesce((p_settings->>'show_events')::boolean,show_events),
  show_footer=coalesce((p_settings->>'show_footer')::boolean,show_footer)
  where wedding_id=p_id;
 end $$;
