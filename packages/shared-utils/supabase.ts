import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton
 * Reads configuration from environment variables and creates a single instance
 */

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client singleton
 * Reads from EXPO_PUBLIC_* (mobile) or VITE_* (extension) environment variables
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Read environment variables (cross-platform)
  const supabaseUrl = 
    process.env.EXPO_PUBLIC_SB_URL || 
    process.env.VITE_SB_URL ||
    // @ts-ignore - Vite env
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SB_URL);

  const supabaseAnonKey = 
    process.env.EXPO_PUBLIC_SB_ANON_KEY || 
    process.env.VITE_SB_ANON_KEY ||
    // @ts-ignore - Vite env
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SB_ANON_KEY);

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration missing. Please set EXPO_PUBLIC_SB_URL and EXPO_PUBLIC_SB_ANON_KEY (mobile) or VITE_SB_URL and VITE_SB_ANON_KEY (extension)'
    );
  }

  // Create Supabase client with recommended settings
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Storage adapter will be set by platform-specific code if needed
    },
  });

  return supabaseInstance;
}

/**
 * Reset the Supabase singleton (useful for testing)
 */
export function resetSupabase(): void {
  supabaseInstance = null;
}

/**
 * Database types for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      aliases: {
        Row: {
          alias: string;
          address: string;
          owner_uid: string;
          created_at: string;
        };
        Insert: {
          alias: string;
          address: string;
          owner_uid: string;
          created_at?: string;
        };
        Update: {
          alias?: string;
          address?: string;
          owner_uid?: string;
          created_at?: string;
        };
      };
      throne_links: {
        Row: {
          id: string;
          owner_user_id: string;
          type: 'token' | 'nft' | 'bundle';
          payload: any;
          created_at: string;
          expires_at: string | null;
          used: boolean;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          type: 'token' | 'nft' | 'bundle';
          payload: any;
          created_at?: string;
          expires_at?: string | null;
          used?: boolean;
        };
        Update: {
          id?: string;
          owner_user_id?: string;
          type?: 'token' | 'nft' | 'bundle';
          payload?: any;
          created_at?: string;
          expires_at?: string | null;
          used?: boolean;
        };
      };
      users: {
        Row: {
          uid: string;
          alias: string | null;
          created_at: string;
          updated_at: string;
          preferences: any;
        };
        Insert: {
          uid: string;
          alias?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: any;
        };
        Update: {
          uid?: string;
          alias?: string | null;
          created_at?: string;
          updated_at?: string;
          preferences?: any;
        };
      };
    };
  };
}

