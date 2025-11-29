import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// YOUR CREDENTIALS
const SUPABASE_URL = 'https://envhrnrcyjygsnnbawzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_X8x5BSAZ0tGZscsXvnQqxQ_-X6kgC8G'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
