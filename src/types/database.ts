export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
          price: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_url?: string | null;
          price: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_url?: string | null;
          price?: number;
          is_published?: boolean;
          created_at?: string;
        };
      };
      book_pages: {
        Row: {
          id: string;
          book_id: string;
          page_number: number;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          page_number: number;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          page_number?: number;
          image_url?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      user_books: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          granted_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
