import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables');
}

// Create a client if variables exist, otherwise create a mock or throw improved error only when accessed
// For now, we'll try to create it but it might fail if we don't handle the nulls.
// Better approach: export a nullable client or a dummy one.

// Helper to validate URL
const isValidUrl = (url: string) => {
    try {
        return url.startsWith('http');
    } catch {
        return false;
    }
};

export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
    ? createClient(supabaseUrl, supabaseKey)
    : null;
