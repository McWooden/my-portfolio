import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { error } = await supabase.from('projects').select('published').limit(1);
  if (error) {
    console.log('Error querying projects.published (column likely does not exist):', error.message);
  } else {
    console.log('Success querying projects.published! Column exists.');
  }

  const { error: blogError } = await supabase.from('blogs').select('published').limit(1);
  if (blogError) {
    console.log('Error querying blogs.published (column likely does not exist):', blogError.message);
  } else {
    console.log('Success querying blogs.published! Column exists.');
  }
}
check();
