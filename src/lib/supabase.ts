
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rvxmjqeqfurufbnsluft.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2eG1qcWVxZnVydWZibnNsdWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODM5NTIsImV4cCI6MjA3NjI1OTk1Mn0.SNtoJwNryKnWPjwBKr5TJkkqR6ztLmntzy4k5sNks4k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Google auth helper function
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  
  if (error) throw error
  return data
}

// Create the necessary database tables for the app
export const setupDatabase = async () => {
  // Create profiles table if it doesn't exist
  const { error: profilesError } = await supabase.rpc('create_profiles_if_not_exists')
  if (profilesError) console.error('Error setting up profiles table:', profilesError)

  // Create invoices table if it doesn't exist
  const { error: invoicesError } = await supabase.rpc('create_invoices_if_not_exists')
  if (invoicesError) console.error('Error setting up invoices table:', invoicesError)

  return { success: !profilesError && !invoicesError }
}

/*
IMPORTANT: Run this SQL in your Supabase SQL Editor to set up the database tables:

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  company_name text,
  company_logo text,
  address text,
  phone text,
  website text,
  subscription_tier text default 'free',
  invoices_created_this_month integer default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profile"
  on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update using (auth.uid() = id);

-- Create invoices table
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  invoice_number text not null,
  client_name text,
  client_email text,
  client_address text,
  issue_date date not null,
  due_date date,
  subtotal decimal(10,2) not null,
  tax_amount decimal(10,2) default 0,
  discount_amount decimal(10,2) default 0,
  total_amount decimal(10,2) not null,
  notes text,
  payment_terms text,
  invoice_data jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS for invoices
alter table public.invoices enable row level security;

-- Create RLS policies for invoices
create policy "Users can view their own invoices"
  on public.invoices
  for select using (auth.uid() = user_id);
  
create policy "Users can insert their own invoices"
  on public.invoices
  for insert with check (auth.uid() = user_id);
  
create policy "Users can update their own invoices"
  on public.invoices
  for update using (auth.uid() = user_id);
  
create policy "Users can delete their own invoices"
  on public.invoices
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoices_created_at on public.invoices(created_at);
create index if not exists idx_invoices_invoice_number on public.invoices(invoice_number);

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_invoices_updated_at
  before update on public.invoices
  for each row execute procedure update_updated_at_column();

-- Create function to track invoice count
create or replace function track_invoice_count()
returns trigger as $$
begin
  update profiles
  set invoices_created_this_month = invoices_created_this_month + 1
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for invoice count tracking
create trigger on_invoice_created
  after insert on public.invoices
  for each row execute procedure track_invoice_count();

-- Create function to reset monthly invoice count (run this monthly)
create or replace function reset_monthly_invoice_count()
returns void as $$
begin
  update profiles
  set invoices_created_this_month = 0;
end;
$$ language plpgsql security definer;
*/
