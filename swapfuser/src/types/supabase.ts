export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          is_admin: boolean;
          is_super_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          is_admin?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          is_admin?: boolean;
          is_super_admin?: boolean;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          type: "sell" | "swap";
          title: string;
          description: string | null;
          images: string[];
          price: number | null;
          swap_for: string | null;
          category: string | null;
          condition: "New" | "Like New" | "Good" | "Fair" | null;
          location: string | null;
          lat: number | null;
          lng: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "sell" | "swap";
          title: string;
          description?: string | null;
          images?: string[];
          price?: number | null;
          swap_for?: string | null;
          category?: string | null;
          condition?: "New" | "Like New" | "Good" | "Fair" | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          type?: "sell" | "swap";
          title?: string;
          description?: string | null;
          images?: string[];
          price?: number | null;
          swap_for?: string | null;
          category?: string | null;
          condition?: "New" | "Like New" | "Good" | "Fair" | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      comments: {
        Row: { id: string; user_id: string; post_id: string; body: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; body: string; created_at?: string };
        Update: { body?: string };
        Relationships: [];
      };
      saves: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      conversations: {
        Row: { id: string; item_id: string | null; created_at: string };
        Insert: { id?: string; item_id?: string | null; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      participants: {
        Row: { conversation_id: string; user_id: string };
        Insert: { conversation_id: string; user_id: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          image_url: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          image_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Update: { read_at?: string | null };
        Relationships: [];
      };
      swap_requests: {
        Row: {
          id: string;
          post_id: string;
          requester_id: string;
          offer_description: string | null;
          status: "pending" | "accepted" | "declined";
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          requester_id: string;
          offer_description?: string | null;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
        };
        Update: { status?: "pending" | "accepted" | "declined" };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewee_id: string;
          post_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewee_id: string;
          post_id?: string | null;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: { comment?: string | null };
        Relationships: [];
      };
      contact_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          status: "new" | "resolved";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          status?: "new" | "resolved";
          created_at?: string;
        };
        Update: { status?: "new" | "resolved" };
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: number;
          allow_signups: boolean;
          post_approval_required: boolean;
          public_profiles: boolean;
          contact_form_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          allow_signups?: boolean;
          post_approval_required?: boolean;
          public_profiles?: boolean;
          contact_form_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          allow_signups?: boolean;
          post_approval_required?: boolean;
          public_profiles?: boolean;
          contact_form_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          total_users: number;
          active_users_7d: number;
          total_posts: number;
          open_contact_requests: number;
        }[];
      };
      admin_list_users: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          is_super_admin: boolean;
          created_at: string;
          last_sign_in_at: string | null;
        }[];
      };
      admin_activity_since: {
        Args: { since: string };
        Returns: { created_at: string; kind: "post" | "comment" | "signup" }[];
      };
    };
    Enums: Record<string, never>;
  };
}
