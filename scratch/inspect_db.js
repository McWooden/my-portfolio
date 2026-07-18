import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ilhbdynmqkwloxyftvej.supabase.co";
const supabaseAnonKey = "sb_publishable_DeEOKbU6bOoJNhu-jPfgTw_6j8WWRg6";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Querying account_members table...');
  const { data: members, error: memErr } = await supabase
    .from('account_members')
    .select('*, accounts(name)');

  if (memErr) {
    console.error('Error fetching members:', memErr);
  } else {
    console.log('Account Members:', JSON.stringify(members, null, 2));
  }

  console.log('Querying authorized_emails table...');
  const { data: emails, error: emailErr } = await supabase
    .from('authorized_emails')
    .select('*');

  if (emailErr) {
    console.error('Error fetching emails:', emailErr);
  } else {
    console.log('Authorized Emails:', JSON.stringify(emails, null, 2));
  }
}

test();
