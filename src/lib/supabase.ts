import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iqedxusjtawqvisbypnf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZWR4dXNqdGF3cXZpc2J5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjgyNDQsImV4cCI6MjEwMDc0NDI0NH0.LsJEJcSHX42e6hErBWffMZ-1xXfWlRFKeXy9BhkKVqA";

// Allow override via environment variables for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
