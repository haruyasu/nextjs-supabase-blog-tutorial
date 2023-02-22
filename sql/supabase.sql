-- blogsテーブル作成
create table blogs (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- blogsテーブルRLS設定
alter table blogs enable row level security;
create policy "ブログは誰でも参照可能" on blogs for select using ( true );
create policy "自身のブログを追加" on blogs for insert with check (auth.uid() = user_id);
create policy "自身のブログを更新" on blogs for update using (auth.uid() = user_id);
create policy "自身のブログを削除" on blogs for delete using (auth.uid() = user_id);

-- profilesテーブル作成
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  avatar_url text
);

-- profilesテーブルRLS設定
alter table profiles enable row level security;
create policy "プロフィールは誰でも参照可能" on profiles for select using ( true );
create policy "自身のプロフィールを更新" on profiles for update using (auth.uid() = id);

-- サインアップ時にプロフィールテーブル作成する関数
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- サインアップ時にプロフィールテーブル作成する関数を呼び出すトリガー
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ブログのstorage作成
-- publicでstorageを作成する場合
insert into storage.buckets (id, name, public) values ('blogs', 'blogs', true);
create policy "画像は誰でも参照可能" on storage.objects for select using ( bucket_id = 'blogs' );
create policy "画像はログインユーザーが追加" on storage.objects for insert with check ( bucket_id = 'blogs' AND auth.role() = 'authenticated' );
create policy "自身の画像を更新" on storage.objects for update with check ( bucket_id = 'blogs' AND auth.uid() = owner );
create policy "自身の画像を削除" on storage.objects for delete using ( bucket_id = 'blogs' AND auth.uid() = owner );

-- プロフィールのstorage作成
insert into storage.buckets (id, name, public) values ('profile', 'profile', true);
create policy "プロフィール画像は誰でも参照可能" on storage.objects for select using ( bucket_id = 'profile' );
create policy "プロフィール画像はログインユーザーが追加" on storage.objects for insert with check ( bucket_id = 'profile' AND auth.role() = 'authenticated' );
create policy "自身のプロフィール画像を更新" on storage.objects for update with check ( bucket_id = 'profile' AND auth.uid() = owner );
create policy "自身のプロフィール画像を削除" on storage.objects for delete using ( bucket_id = 'profile' AND auth.uid() = owner );