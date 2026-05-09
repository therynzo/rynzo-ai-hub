import { createClient } from '@supabase/supabase-js';
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = 'therynzo7@gmail.com';
const password = 'rynzo#1234';

// Check existing
const { data: list } = await supa.auth.admin.listUsers();
const existing = list.users.find(u => u.email?.toLowerCase() === email);

let userId;
if (existing) {
  console.log('User exists, updating password & confirming...');
  const { data, error } = await supa.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
  if (error) throw error;
  userId = existing.id;
} else {
  console.log('Creating user...');
  const { data, error } = await supa.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { username: 'TheRynzo' }
  });
  if (error) throw error;
  userId = data.user.id;
}
console.log('User ID:', userId);

// Ensure admin role
const { error: rErr } = await supa.from('user_roles').upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
if (rErr) console.log('Role err:', rErr.message); else console.log('Admin role granted.');

// Ensure profile
await supa.from('profiles').upsert({ id: userId, email, username: 'TheRynzo' });
console.log('Done.');
