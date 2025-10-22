-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Create entries table
create table entries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  shape text not null,
  color text not null,
  created_by uuid references auth.users on delete cascade not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table entries enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Entries policies
create policy "Anyone authenticated can view entries"
  on entries for select
  to authenticated
  using (true);

create policy "Admins can insert entries"
  on entries for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update entries"
  on entries for update
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete entries"
  on entries for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
