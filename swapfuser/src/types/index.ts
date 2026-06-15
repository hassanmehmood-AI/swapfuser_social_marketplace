export type PostType = "sell" | "swap";
export type Condition = "new" | "like_new" | "good" | "fair";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  listings_count: number;
  followers_count: number;
  following_count: number;
  swaps_count: number;
  rating: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  type: PostType;
  title: string;
  description: string;
  images: string[];
  price: number | null;
  swap_for: string | null;
  category: string;
  condition: Condition;
  location: string;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
  created_at: string;
  profile: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  image_url: string | null;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  item_id: string | null;
  post: Post | null;
  participants: Profile[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer: Profile;
  rating: number;
  comment: string;
  created_at: string;
}
