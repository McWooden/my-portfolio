const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "exists (length: " + supabaseAnonKey.length + ")" : "missing");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title')
      .limit(2);
    
    if (error) {
      console.error("Database query failed:");
      console.error("Code:", error.code);
      console.error("Message:", error.message);
      console.error("Details:", error.details);
      console.error("Hint:", error.hint);
    } else {
      console.log("Query successful! Data sample:", data);
    }
  } catch (err) {
    console.error("Catch error:", err);
  }
}

test();
