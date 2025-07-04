// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://synxbltpgyqycslpbojj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bnhibHRwZ3lxeWNzbHBib2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTQxNDEsImV4cCI6MjA2Njg3MDE0MX0.SwFN0YTSa00NnTxB7OpSmRwOZOj-o5AAfXFZTGZNFoo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});