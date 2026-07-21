const { createClient } = require('@supabase/supabase-js');
// Load environment variables manually
const fs = require('fs');
const path = require('path');
const dotenvPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "exists (length: " + supabaseAnonKey.length + ")" : "missing");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'homepage')
      .single();

    if (settingsError) {
      console.log("Settings query failed:", settingsError);
    } else {
      console.log("Settings query succeeded:", settingsData);
    }

    const { data, error } = await supabase
      .from('stories')
      .select('id, title')
      .limit(2);
    
    if (error) {
      console.error("Database query failed:");
      console.error("Code:", error.code);
    } else {
      console.log("Stories query successful:", data);
    }
  } catch (err) {
    console.error("Catch error:", err);
  }
}

test();
