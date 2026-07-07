import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types for TypeScript
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface PartnerLink {
  id: string;
  user_id: string;
  partner_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  name: string;
  color: string;
  rest_days: number[]; // Array of day numbers (0-6) where 0 is Sunday
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completed_date: string; // ISO date string
  created_at: string;
}

export interface Touch {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}
