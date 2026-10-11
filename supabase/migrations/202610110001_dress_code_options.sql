alter table public.wedding_settings
  add column dress_code_eyebrow text not null default 'PARA CELEBRAR JUNTOS',
  add column dress_code_title text not null default 'Código de vestimenta',
  add column dress_code_note text not null default '',
  add column show_dress_code_colors boolean not null default false,
  add column dress_code_colors jsonb not null default '[{"name":"Rosa antiguo","hex":"#af8278"},{"name":"Arena","hex":"#b9ad91"},{"name":"Verde oliva","hex":"#7f846b"},{"name":"Malva","hex":"#a39490"},{"name":"Azul celeste","hex":"#bcd9ee"},{"name":"Verde menta","hex":"#c5e4d3"},{"name":"Amarillo claro","hex":"#f5e6a6"},{"name":"Rosa palo","hex":"#f1cfd4"},{"name":"Lavanda","hex":"#d9cdea"},{"name":"Durazno","hex":"#f5d3b9"}]'::jsonb
    check (jsonb_typeof(dress_code_colors) = 'array' and jsonb_array_length(dress_code_colors) <= 24);

create or replace function public.save_wedding_settings(p_id uuid,p_wedding jsonb,p_settings jsonb) returns void language plpgsql security invoker set search_path='' as $$ begin
 if not public.can_manage(p_id) then raise exception 'FORBIDDEN'; end if;
 update public.weddings set bride_name=p_wedding->>'bride_name',groom_name=p_wedding->>'groom_name',title=p_wedding->>'title',description=p_wedding->>'description',wedding_date=(p_wedding->>'wedding_date')::timestamptz,rsvp_deadline=(p_wedding->>'rsvp_deadline')::timestamptz,timezone=p_wedding->>'timezone',status=p_wedding->>'status' where id=p_id;
 insert into public.wedding_settings(wedding_id) values(p_id) on conflict do nothing;
 update public.wedding_settings set envelope_message=p_settings->>'envelope_message',story=p_settings->>'story',dress_code=p_settings->>'dress_code',final_message=p_settings->>'final_message',show_story=(p_settings->>'show_story')::boolean,show_countdown=(p_settings->>'show_countdown')::boolean,show_gallery=(p_settings->>'show_gallery')::boolean,show_maps=(p_settings->>'show_maps')::boolean,show_dress_code=(p_settings->>'show_dress_code')::boolean,show_rsvp=(p_settings->>'show_rsvp')::boolean,show_music=(p_settings->>'show_music')::boolean,music_url=p_settings->>'music_url',
  dress_code_eyebrow=coalesce(p_settings->>'dress_code_eyebrow',dress_code_eyebrow),dress_code_title=coalesce(p_settings->>'dress_code_title',dress_code_title),dress_code_note=coalesce(p_settings->>'dress_code_note',dress_code_note),show_dress_code_colors=coalesce((p_settings->>'show_dress_code_colors')::boolean,show_dress_code_colors),dress_code_colors=coalesce(p_settings->'dress_code_colors',dress_code_colors)
  where wedding_id=p_id;
 end $$;
