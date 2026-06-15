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
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
