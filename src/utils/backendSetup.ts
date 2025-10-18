
// This file contains information about the Supabase backend setup
// and Vercel deployment for the Artirexa Invoice Creator

/**
 * Supabase Setup Instructions:
 * 
 * 1. Create a Supabase project at https://supabase.com
 * 2. Set up the following tables:
 *    - users: Created automatically by Supabase Auth
 *    - profiles: For storing user profile information
 *    - invoices: For storing invoice data
 *    - invoice_items: For storing invoice line items
 *    - subscriptions: For tracking user subscription status
 * 
 * 3. Set up Row Level Security (RLS) policies for each table
 * 4. Create the necessary functions for business logic
 */

// Sample Supabase table schemas
export const databaseSchema = {
  profiles: `
    create table profiles (
      id uuid references auth.users on delete cascade not null primary key,
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

    -- Set up Row Level Security
    alter table profiles enable row level security;
    create policy "Users can view their own profile" on profiles
      for select using (auth.uid() = id);
    create policy "Users can update their own profile" on profiles
      for update using (auth.uid() = id);
  `,
  
  invoices: `
    create table invoices (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users not null,
      invoice_number text not null,
      client_name text not null,
      client_email text,
      client_address text,
      issue_date date not null,
      due_date date,
      subtotal decimal not null,
      tax_rate decimal,
      tax_amount decimal,
      discount_rate decimal,
      discount_amount decimal,
      total_amount decimal not null,
      notes text,
      status text default 'draft',
      created_at timestamp with time zone default now() not null,
      updated_at timestamp with time zone default now() not null
    );

    -- Set up Row Level Security
    alter table invoices enable row level security;
    create policy "Users can view their own invoices" on invoices
      for select using (auth.uid() = user_id);
    create policy "Users can insert their own invoices" on invoices
      for insert with check (auth.uid() = user_id);
    create policy "Users can update their own invoices" on invoices
      for update using (auth.uid() = user_id);
    create policy "Users can delete their own invoices" on invoices
      for delete using (auth.uid() = user_id);
  `,
  
  invoice_items: `
    create table invoice_items (
      id uuid default uuid_generate_v4() primary key,
      invoice_id uuid references invoices on delete cascade not null,
      description text not null,
      quantity decimal not null,
      unit_price decimal not null,
      discount_rate decimal default 0,
      amount decimal not null,
      created_at timestamp with time zone default now() not null,
      updated_at timestamp with time zone default now() not null
    );

    -- Set up Row Level Security
    alter table invoice_items enable row level security;
    create policy "Users can view their own invoice items" on invoice_items
      for select using (
        auth.uid() = (select user_id from invoices where id = invoice_id)
      );
    create policy "Users can insert their own invoice items" on invoice_items
      for insert with check (
        auth.uid() = (select user_id from invoices where id = invoice_id)
      );
    create policy "Users can update their own invoice items" on invoice_items
      for update using (
        auth.uid() = (select user_id from invoices where id = invoice_id)
      );
    create policy "Users can delete their own invoice items" on invoice_items
      for delete using (
        auth.uid() = (select user_id from invoices where id = invoice_id)
      );
  `,
  
  subscriptions: `
    create table subscriptions (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users not null,
      stripe_customer_id text,
      stripe_subscription_id text,
      tier text not null,
      status text not null,
      current_period_start timestamp with time zone,
      current_period_end timestamp with time zone,
      created_at timestamp with time zone default now() not null,
      updated_at timestamp with time zone default now() not null
    );

    -- Set up Row Level Security
    alter table subscriptions enable row level security;
    create policy "Users can view their own subscriptions" on subscriptions
      for select using (auth.uid() = user_id);
  `
};

/**
 * Supabase Functions:
 * 
 * 1. track_invoice_count: Increment the invoices_created_this_month count when an invoice is created
 * 2. reset_monthly_invoice_count: Reset the invoices_created_this_month count on the first day of each month
 * 3. check_invoice_limit: Check if a free tier user has reached their limit
 */

export const supabaseFunctions = {
  trackInvoiceCount: `
    create or replace function track_invoice_count()
    returns trigger as $$
    begin
      update profiles
      set invoices_created_this_month = invoices_created_this_month + 1
      where id = new.user_id;
      return new;
    end;
    $$ language plpgsql security definer;

    create trigger on_invoice_created
      after insert on invoices
      for each row execute procedure track_invoice_count();
  `,
  
  resetMonthlyInvoiceCount: `
    create or replace function reset_monthly_invoice_count()
    returns void as $$
    begin
      update profiles
      set invoices_created_this_month = 0;
    end;
    $$ language plpgsql security definer;
  `,
  
  checkInvoiceLimit: `
    create or replace function check_invoice_limit(user_uuid uuid)
    returns boolean as $$
    declare
      subscription_tier text;
      invoice_count int;
    begin
      select p.subscription_tier, p.invoices_created_this_month
      into subscription_tier, invoice_count
      from profiles p
      where p.id = user_uuid;
      
      -- If user is on premium tier, always allow
      if subscription_tier = 'premium' then
        return true;
      end if;
      
      -- Free tier users are limited to 10 invoices per month
      return invoice_count < 10;
    end;
    $$ language plpgsql security definer;
  `
};

/**
 * Vercel Deployment Instructions:
 * 
 * 1. Create a Vercel account if you don't have one
 * 2. Connect your GitHub repository to Vercel
 * 3. Add the following environment variables to your Vercel project:
 *    - VITE_SUPABASE_URL: Your Supabase project URL
 *    - VITE_SUPABASE_ANON_KEY: Your Supabase anon key
 *    - VITE_STRIPE_PUBLIC_KEY: Your Stripe publishable key
 * 4. Deploy your project
 * 
 * For custom domain setup:
 * 1. Add your domain in Vercel project settings
 * 2. Configure DNS settings as instructed by Vercel
 * 3. Wait for DNS propagation and SSL certificate setup
 */

export const vercelConfig = {
  build: {
    env: {
      VITE_SUPABASE_URL: "Your Supabase URL",
      VITE_SUPABASE_ANON_KEY: "Your Supabase Anon Key",
      VITE_STRIPE_PUBLIC_KEY: "Your Stripe Publishable Key"
    },
    command: "npm run build",
    output: "dist"
  },
  routes: [
    { src: "/(.*)", dest: "/index.html" }
  ]
};

/**
 * To integrate with Supabase on the client side:
 * 1. Install Supabase client: npm install @supabase/supabase-js
 * 2. Create a client instance in your app
 * 3. Use the client for authentication, database operations, etc.
 */

/**
 * To integrate Stripe:
 * 1. Install Stripe.js: npm install @stripe/stripe-js
 * 2. Create a checkout session when a user subscribes to premium
 * 3. Handle the callback from Stripe to update the user's subscription status
 */
