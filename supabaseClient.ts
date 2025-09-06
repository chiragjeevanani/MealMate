import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vnbhvfqykqkjsnwuhcgt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYmh2ZnF5a3FranNud3VoY2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDY3NzMsImV4cCI6MjA3MjY4Mjc3M30.dZewWXSsDoN1PUTeC8nj-9a72cKI13cj3zZqgUVAFdc";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
