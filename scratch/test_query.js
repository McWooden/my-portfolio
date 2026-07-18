import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ilhbdynmqkwloxyftvej.supabase.co";
const supabaseAnonKey = "sb_publishable_DeEOKbU6bOoJNhu-jPfgTw_6j8WWRg6";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Querying stories table...');
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching stories:', error);
  } else {
    console.log('Successfully fetched stories count:', data.length);
  }
}

test();
