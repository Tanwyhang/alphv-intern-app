-- Add insert policy for profiles to allow upsert
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);
