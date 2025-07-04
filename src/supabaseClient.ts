import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdnkanmulsdppqfarqkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmthbm11bHNkcHBxZmFycWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzE2MzgsImV4cCI6MjA2NzIwNzYzOH0.1c5zf8mbSgKOG6hrkhmC3hTDLI5QH2WLCRm-15168yA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
