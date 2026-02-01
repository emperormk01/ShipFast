
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jeubgcbjexemepbjsjid.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3_Jlz1GcAsMF_9XopUIkKA_4gvcCZBy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
