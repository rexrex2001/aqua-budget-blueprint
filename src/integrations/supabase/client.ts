// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rsaufoaevnzfqhiivktr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYXVmb2Fldm56ZnFoaWl2a3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzYxMTYsImV4cCI6MjA2MzIxMjExNn0.aQM6wz-lAcdxEB1PRIZHYhjFRtpIifR59SRIb1dz2FI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);