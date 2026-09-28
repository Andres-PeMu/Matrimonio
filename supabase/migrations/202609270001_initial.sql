create extension if not exists pgcrypto;
create table public.profiles (id uuid primary key references auth.users on delete cascade, role text not null check(role in ('ADMIN','SUPER_ADMIN')), display_name text not null default '', created_at timestamptz not null default now());
create table public.weddings (
 id uuid primary key default gen_random_uuid(), slug text not null unique, bride_name text not null, groom_name text not null, title text not null, description text not null default '', wedding_date timestamptz not null, timezone text not null default 'America/Bogota', rsvp_deadline timestamptz not null, status text not null default 'DRAFT' check(status in ('DRAFT','PUBLISHED')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.wedding_admins (wedding_id uuid not null references public.weddings on delete restrict, user_id uuid not null references public.profiles on delete cascade, primary key(wedding_id,user_id));
create table public.guests (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, name text not null check(length(name) between 1 and 150), phone text, email text, guest_limit integer not null check(guest_limit between 1 and 30), invitation_token text not null unique default encode(gen_random_bytes(32),'hex') check(length(invitation_token)>=32), status text not null default 'PENDING' check(status in ('PENDING','CONFIRMED','DECLINED')), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,wedding_id)
);
create table public.guest_confirmations (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, guest_id uuid not null unique, status text not null check(status in ('CONFIRMED','DECLINED')), attendees_count integer not null check(attendees_count between 0 and 30), message text check(length(message)<=2000), confirmed_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), foreign key(guest_id,wedding_id) references public.guests(id,wedding_id) on delete cascade, unique(id,wedding_id), check((status='DECLINED' and attendees_count=0) or (status='CONFIRMED' and attendees_count>0))
);
create table public.attendees (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, confirmation_id uuid not null, name text not null check(length(btrim(name)) between 1 and 150), is_primary_guest boolean not null default false, display_order integer not null default 0, created_at timestamptz not null default now(), foreign key(confirmation_id,wedding_id) references public.guest_confirmations(id,wedding_id) on delete cascade
);
create table public.locations (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, name text not null, description text not null default '', address text not null default '', city text not null default '', state text not null default '', country text not null default 'Colombia', latitude double precision not null check(latitude between -90 and 90), longitude double precision not null check(longitude between -180 and 180), parking_information text not null default '', additional_information text not null default '', is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,wedding_id)
);
create table public.wedding_events (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, location_id uuid, name text not null, type text not null check(type in ('CEREMONY','RECEPTION','DINNER','PARTY','OTHER')), description text not null default '', event_date date not null, start_time time not null, end_time time, display_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), foreign key(location_id,wedding_id) references public.locations(id,wedding_id) on delete restrict
);
create table public.wedding_settings (
 wedding_id uuid primary key references public.weddings on delete restrict, envelope_message text not null default 'Una invitación muy especial para alguien importante…', story text not null default '', dress_code text not null default '', final_message text not null default 'Tu presencia hará este día aún más especial.', show_story boolean not null default true, show_countdown boolean not null default true, show_gallery boolean not null default true, show_maps boolean not null default true, show_dress_code boolean not null default true, show_rsvp boolean not null default true, show_music boolean not null default false, music_url text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.wedding_media (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.weddings on delete restrict, storage_path text not null unique, type text not null default 'GALLERY' check(type in ('GALLERY','COVER')), alt_text text not null default '', display_order integer not null default 0, created_at timestamptz not null default now()
);
create index guests_wedding_status_idx on public.guests(wedding_id,status);
create index confirmations_wedding_idx on public.guest_confirmations(wedding_id,confirmed_at desc);
create index attendees_confirmation_idx on public.attendees(confirmation_id);
create index locations_wedding_idx on public.locations(wedding_id);
create index events_wedding_idx on public.wedding_events(wedding_id,display_order);
create index media_wedding_idx on public.wedding_media(wedding_id,display_order);
create index wedding_admins_user_idx on public.wedding_admins(user_id);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['weddings','guests','guest_confirmations','locations','wedding_events','wedding_settings'] loop execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t); end loop; end $$;
create function public.can_manage(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and (p.role='SUPER_ADMIN' or (p.role='ADMIN' and exists(select 1 from public.wedding_admins wa where wa.user_id=p.id and wa.wedding_id=target))));
$$;
revoke all on function public.can_manage(uuid) from public;
grant execute on function public.can_manage(uuid) to authenticated;
alter table public.profiles enable row level security;
alter table public.wedding_admins enable row level security;
alter table public.weddings enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy own_memberships on public.wedding_admins for select to authenticated using(user_id=auth.uid());
create policy manage_weddings on public.weddings for select to authenticated using(public.can_manage(id));
create policy update_weddings on public.weddings for update to authenticated using(public.can_manage(id)) with check(public.can_manage(id));
do $$ declare t text; begin foreach t in array array['guests','locations','wedding_events','wedding_settings','wedding_media'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy manage on public.%I for all to authenticated using(public.can_manage(wedding_id)) with check(public.can_manage(wedding_id))',t);
 end loop;
 foreach t in array array['guest_confirmations','attendees'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy read_confirmations on public.%I for select to authenticated using(public.can_manage(wedding_id))',t);
 end loop; end $$;
-- No public policies: public invitation access is filtered by the Next.js server.
-- Confirmation writes are restricted to the service-only atomic RPC below.
revoke all on public.profiles, public.wedding_admins, public.weddings, public.guests, public.guest_confirmations, public.attendees, public.locations, public.wedding_events, public.wedding_settings, public.wedding_media from anon;
revoke insert, update, delete on public.profiles, public.wedding_admins, public.guest_confirmations, public.attendees from authenticated;
create function public.check_guest_limit() returns trigger language plpgsql set search_path='' as $$
 begin if exists(select 1 from public.guest_confirmations where guest_id=new.id and attendees_count>new.guest_limit) then raise exception 'LIMIT_BELOW_CONFIRMED'; end if; return new; end $$;
create trigger protect_guest_limit before update of guest_limit on public.guests for each row execute function public.check_guest_limit();
create function public.submit_rsvp(p_token text, p_status text, p_names text[], p_message text default '') returns uuid language plpgsql security definer set search_path='' as $$
 declare g public.guests; w public.weddings; cid uuid; n integer; begin
 select * into g from public.guests where invitation_token=p_token for update;
 if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
 select * into w from public.weddings where id=g.wedding_id for share;
 if w.status<>'PUBLISHED' then raise exception 'INVITATION_NOT_FOUND'; end if;
 if clock_timestamp()>w.rsvp_deadline then raise exception 'DEADLINE_PASSED'; end if;
 if not exists(select 1 from public.wedding_settings where wedding_id=w.id and show_rsvp) then raise exception 'RSVP_DISABLED'; end if;
 n=coalesce(cardinality(p_names),0);
 if p_status not in ('CONFIRMED','DECLINED') or p_status is null or n>g.guest_limit or (p_status='CONFIRMED' and n<1) or (p_status='DECLINED' and n<>0) then raise exception 'INVALID_ATTENDEES'; end if;
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
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('wedding-media','wedding-media',true,4194304,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create function public.media_wedding(path text) returns uuid language plpgsql immutable set search_path='' as $$ begin return split_part(path,'/',1)::uuid; exception when invalid_text_representation then return null; end $$;
create policy media_upload on storage.objects for insert to authenticated with check(bucket_id='wedding-media' and public.can_manage(public.media_wedding(name)));
create policy media_read on storage.objects for select to authenticated using(bucket_id='wedding-media' and public.can_manage(public.media_wedding(name)));
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='wedding-media' and public.can_manage(public.media_wedding(name)));
-- Public bucket only contains intentionally public wedding photographs.
