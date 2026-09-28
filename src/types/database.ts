export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attendees: {
        Row: {
          confirmation_id: string;
          created_at: string;
          display_order: number;
          id: string;
          is_primary_guest: boolean;
          name: string;
          wedding_id: string;
        };
        Insert: {
          confirmation_id: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_primary_guest?: boolean;
          name: string;
          wedding_id: string;
        };
        Update: {
          confirmation_id?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_primary_guest?: boolean;
          name?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'attendees_confirmation_id_wedding_id_fkey';
            columns: ['confirmation_id', 'wedding_id'];
            isOneToOne: false;
            referencedRelation: 'guest_confirmations';
            referencedColumns: ['id', 'wedding_id'];
          },
          {
            foreignKeyName: 'attendees_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      guest_confirmations: {
        Row: {
          attendees_count: number;
          confirmed_at: string;
          created_at: string;
          guest_id: string;
          id: string;
          message: string | null;
          status: string;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          attendees_count: number;
          confirmed_at?: string;
          created_at?: string;
          guest_id: string;
          id?: string;
          message?: string | null;
          status: string;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          attendees_count?: number;
          confirmed_at?: string;
          created_at?: string;
          guest_id?: string;
          id?: string;
          message?: string | null;
          status?: string;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guest_confirmations_guest_id_wedding_id_fkey';
            columns: ['guest_id', 'wedding_id'];
            isOneToOne: false;
            referencedRelation: 'guests';
            referencedColumns: ['id', 'wedding_id'];
          },
          {
            foreignKeyName: 'guest_confirmations_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      guests: {
        Row: {
          created_at: string;
          email: string | null;
          guest_limit: number;
          id: string;
          invitation_token: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: string;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          guest_limit: number;
          id?: string;
          invitation_token?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          guest_limit?: number;
          id?: string;
          invitation_token?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guests_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      locations: {
        Row: {
          additional_information: string;
          address: string;
          city: string;
          country: string;
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          name: string;
          parking_information: string;
          state: string;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          additional_information?: string;
          address?: string;
          city?: string;
          country?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          latitude: number;
          longitude: number;
          name: string;
          parking_information?: string;
          state?: string;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          additional_information?: string;
          address?: string;
          city?: string;
          country?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number;
          longitude?: number;
          name?: string;
          parking_information?: string;
          state?: string;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'locations_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          role: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          id: string;
          role: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: string;
        };
        Relationships: [];
      };
      wedding_admins: {
        Row: {
          user_id: string;
          wedding_id: string;
        };
        Insert: {
          user_id: string;
          wedding_id: string;
        };
        Update: {
          user_id?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wedding_admins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'wedding_admins_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_events: {
        Row: {
          created_at: string;
          description: string;
          display_order: number;
          end_time: string | null;
          event_date: string;
          id: string;
          is_active: boolean;
          location_id: string | null;
          name: string;
          start_time: string;
          type: string;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          display_order?: number;
          end_time?: string | null;
          event_date: string;
          id?: string;
          is_active?: boolean;
          location_id?: string | null;
          name: string;
          start_time: string;
          type: string;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          display_order?: number;
          end_time?: string | null;
          event_date?: string;
          id?: string;
          is_active?: boolean;
          location_id?: string | null;
          name?: string;
          start_time?: string;
          type?: string;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wedding_events_location_id_wedding_id_fkey';
            columns: ['location_id', 'wedding_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id', 'wedding_id'];
          },
          {
            foreignKeyName: 'wedding_events_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_media: {
        Row: {
          alt_text: string;
          created_at: string;
          display_order: number;
          id: string;
          storage_path: string;
          type: string;
          wedding_id: string;
        };
        Insert: {
          alt_text?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          storage_path: string;
          type?: string;
          wedding_id: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          storage_path?: string;
          type?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wedding_media_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: false;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_settings: {
        Row: {
          created_at: string;
          dress_code: string;
          envelope_message: string;
          final_message: string;
          music_url: string;
          show_countdown: boolean;
          show_dress_code: boolean;
          show_gallery: boolean;
          show_maps: boolean;
          show_music: boolean;
          show_rsvp: boolean;
          show_story: boolean;
          story: string;
          updated_at: string;
          wedding_id: string;
        };
        Insert: {
          created_at?: string;
          dress_code?: string;
          envelope_message?: string;
          final_message?: string;
          music_url?: string;
          show_countdown?: boolean;
          show_dress_code?: boolean;
          show_gallery?: boolean;
          show_maps?: boolean;
          show_music?: boolean;
          show_rsvp?: boolean;
          show_story?: boolean;
          story?: string;
          updated_at?: string;
          wedding_id: string;
        };
        Update: {
          created_at?: string;
          dress_code?: string;
          envelope_message?: string;
          final_message?: string;
          music_url?: string;
          show_countdown?: boolean;
          show_dress_code?: boolean;
          show_gallery?: boolean;
          show_maps?: boolean;
          show_music?: boolean;
          show_rsvp?: boolean;
          show_story?: boolean;
          story?: string;
          updated_at?: string;
          wedding_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wedding_settings_wedding_id_fkey';
            columns: ['wedding_id'];
            isOneToOne: true;
            referencedRelation: 'weddings';
            referencedColumns: ['id'];
          },
        ];
      };
      weddings: {
        Row: {
          bride_name: string;
          created_at: string;
          description: string;
          groom_name: string;
          id: string;
          rsvp_deadline: string;
          slug: string;
          status: string;
          timezone: string;
          title: string;
          updated_at: string;
          wedding_date: string;
        };
        Insert: {
          bride_name: string;
          created_at?: string;
          description?: string;
          groom_name: string;
          id?: string;
          rsvp_deadline: string;
          slug: string;
          status?: string;
          timezone?: string;
          title: string;
          updated_at?: string;
          wedding_date: string;
        };
        Update: {
          bride_name?: string;
          created_at?: string;
          description?: string;
          groom_name?: string;
          id?: string;
          rsvp_deadline?: string;
          slug?: string;
          status?: string;
          timezone?: string;
          title?: string;
          updated_at?: string;
          wedding_date?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_manage: { Args: { target: string }; Returns: boolean };
      media_wedding: { Args: { path: string }; Returns: string };
      save_wedding_settings: {
        Args: { p_id: string; p_settings: Json; p_wedding: Json };
        Returns: undefined;
      };
      submit_rsvp: {
        Args: {
          p_message?: string;
          p_names: string[];
          p_status: string;
          p_token: string;
        };
        Returns: string;
      };
      wedding_stats: { Args: { p_id: string }; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
