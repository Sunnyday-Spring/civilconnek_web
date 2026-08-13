-- ============================================================
-- SQL SCRIPT FOR CIVIL CONNEK SUPABASE SETUP
-- รันโค้ดนี้ใน Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. สร้างตารางผลงานหลัก (projects)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  location text not null,
  description text,
  year text not null,
  type text not null,
  cover_image text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. สร้างตารางรูปภาพในอัลบั้มขั้นตอนงาน (project_photos)
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  img text not null,
  label text not null,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. เปิดการใช้งาน Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.project_photos enable row level security;

-- 4. ตั้งค่า Policy การเข้าถึงข้อมูล (RLS Policies)
-- ทุกคนสามารถอ่าน/ดูข้อมูลผลงานได้ (Public Read)
drop policy if exists "Public projects are viewable by everyone" on public.projects;
create policy "Public projects are viewable by everyone" on public.projects
  for select using (true);

drop policy if exists "Public project_photos are viewable by everyone" on public.project_photos;
create policy "Public project_photos are viewable by everyone" on public.project_photos
  for select using (true);

-- อนุญาตให้เพิ่ม/ลบ/แก้ไขผลงานได้ (สำหรับผู้ใช้งานทั่วไป หรือ Admin)
drop policy if exists "Enable all for projects" on public.projects;
create policy "Enable all for projects" on public.projects
  for all using (true) with check (true);

drop policy if exists "Enable all for project_photos" on public.project_photos;
create policy "Enable all for project_photos" on public.project_photos
  for all using (true) with check (true);

-- 5. ตั้งค่า Storage Bucket และ RLS Policy สำหรับอัปโหลดรูปภาพ
insert into storage.buckets (id, name, public) 
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access project-images" on storage.objects;
create policy "Public Access project-images" on storage.objects 
  for select using (bucket_id = 'project-images');

drop policy if exists "Public Upload project-images" on storage.objects;
create policy "Public Upload project-images" on storage.objects 
  for insert with check (bucket_id = 'project-images');

drop policy if exists "Public Update project-images" on storage.objects;
create policy "Public Update project-images" on storage.objects 
  for update using (bucket_id = 'project-images');

drop policy if exists "Public Delete project-images" on storage.objects;
create policy "Public Delete project-images" on storage.objects 
  for delete using (bucket_id = 'project-images');

-- 6. สร้างตารางข้อความติดต่อจากลูกค้า (contact_messages)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  detail text,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

drop policy if exists "Enable insert for everyone" on public.contact_messages;
create policy "Enable insert for everyone" on public.contact_messages
  for insert with check (true);

drop policy if exists "Enable select for everyone" on public.contact_messages;
create policy "Enable select for everyone" on public.contact_messages
  for select using (true);

drop policy if exists "Enable update for everyone" on public.contact_messages;
create policy "Enable update for everyone" on public.contact_messages
  for update using (true);

drop policy if exists "Enable delete for everyone" on public.contact_messages;
create policy "Enable delete for everyone" on public.contact_messages
  for delete using (true);

-- 7. สร้างตารางระบบจัดคิวงานก่อสร้าง (construction_queue)
create table if not exists public.construction_queue (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  client_name text not null,
  location text not null,
  start_date text,
  estimated_end_date text,
  status text default 'queued',
  progress_percent int default 0,
  queue_order int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.construction_queue enable row level security;

drop policy if exists "Public construction_queue are viewable by everyone" on public.construction_queue;
create policy "Public construction_queue are viewable by everyone" on public.construction_queue
  for select using (true);

drop policy if exists "Enable all for construction_queue" on public.construction_queue;
create policy "Enable all for construction_queue" on public.construction_queue
  for all using (true) with check (true);
