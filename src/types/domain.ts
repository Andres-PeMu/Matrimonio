export type Status = 'PENDING' | 'CONFIRMED' | 'DECLINED';
export interface Wedding {
  id: string;
  slug: string;
  bride_name: string;
  groom_name: string;
  title: string;
  description: string;
  wedding_date: string;
  timezone: string;
  rsvp_deadline: string;
  status: 'DRAFT' | 'PUBLISHED';
}
export interface Settings {
  wedding_id: string;
  envelope_message: string;
  story: string;
  dress_code: string;
  final_message: string;
  show_story: boolean;
  show_countdown: boolean;
  show_gallery: boolean;
  show_maps: boolean;
  show_dress_code: boolean;
  show_rsvp: boolean;
  show_music: boolean;
  music_url: string;
}
export interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  guest_limit: number;
  invitation_token: string;
  status: Status;
  notes: string | null;
}
export interface Confirmation {
  id: string;
  guest_id: string;
  status: Exclude<Status, 'PENDING'>;
  attendees_count: number;
  message: string | null;
  confirmed_at: string;
  attendees: { name: string; is_primary_guest: boolean }[];
}
export interface Location {
  id: string;
  wedding_id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  parking_information: string;
  additional_information: string;
  is_active: boolean;
}
export interface WeddingEvent {
  id: string;
  wedding_id: string;
  location_id: string | null;
  name: string;
  type: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  display_order: number;
  is_active: boolean;
}
export interface Media {
  id: string;
  wedding_id: string;
  storage_path: string;
  type: 'COVER' | 'GALLERY';
  alt_text: string;
  display_order: number;
  url?: string;
}
export interface PublicWedding {
  wedding: Omit<Wedding, 'id' | 'slug' | 'status'>;
  settings: Omit<Settings, 'wedding_id'>;
  events: Omit<WeddingEvent, 'wedding_id'>[];
  locations: Omit<Location, 'wedding_id'>[];
  media: Pick<Media, 'id' | 'type' | 'alt_text' | 'url'>[];
}
export interface Invitation extends PublicWedding {
  guest: Pick<Guest, 'name' | 'guest_limit' | 'status'>;
  confirmation: Pick<
    Confirmation,
    'status' | 'attendees_count' | 'message' | 'attendees'
  > | null;
}
