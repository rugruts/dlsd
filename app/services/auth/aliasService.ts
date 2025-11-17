import { getSupabase } from '@dumpsack/shared-utils';

export interface AliasRecord {
  alias: string;
  address: string;
  userId: string;
  createdAt: Date;
}

/**
 * Check if an alias is available
 */
export async function isAliasAvailable(alias: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('aliases')
      .select('alias')
      .eq('alias', alias)
      .maybeSingle();

    if (error) {
      console.error('Failed to check alias availability:', error);
      throw new Error('Failed to check alias availability');
    }

    return !data; // Available if no data found
  } catch (error) {
    console.error('Failed to check alias availability:', error);
    throw new Error('Failed to check alias availability');
  }
}

/**
 * Register a new alias
 */
export async function registerAlias(alias: string, address: string, userId: string): Promise<void> {
  try {
    // First check if available
    const available = await isAliasAvailable(alias);
    if (!available) {
      throw new Error('Alias is already taken');
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('aliases')
      .insert({
        alias,
        address,
        owner_uid: userId,
      });

    if (error) {
      console.error('Failed to register alias:', error);
      throw new Error('Failed to register alias');
    }
  } catch (error) {
    console.error('Failed to register alias:', error);
    throw error;
  }
}

/**
 * Resolve an alias to an address
 */
export async function resolveAlias(alias: string): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('aliases')
      .select('address')
      .eq('alias', alias)
      .maybeSingle();

    if (error) {
      console.error('Failed to resolve alias:', error);
      throw new Error('Failed to resolve alias');
    }

    return data?.address || null;
  } catch (error) {
    console.error('Failed to resolve alias:', error);
    throw new Error('Failed to resolve alias');
  }
}

/**
 * Get alias record by user ID
 */
export async function getAliasByUserId(userId: string): Promise<AliasRecord | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('aliases')
      .select('*')
      .eq('owner_uid', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to get alias by user ID:', error);
      throw new Error('Failed to get user alias');
    }

    if (!data) {
      return null;
    }

    return {
      alias: data.alias,
      address: data.address,
      userId: data.owner_uid,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error('Failed to get alias by user ID:', error);
    throw new Error('Failed to get user alias');
  }
}