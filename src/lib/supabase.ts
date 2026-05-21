import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://appzhahfveyzbtwakaqz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcHpoYWhmdmV5emJ0d2FrYXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjAxNDcsImV4cCI6MjA4NzYzNjE0N30.T8gamdsZeW23kfNQJmZUZnXrM8PIXiiVStmGmBaFXLQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
