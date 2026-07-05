-- ============================================================
-- Esquema de base de datos - Marketing AI Studio
-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------
-- 1. PERFILES DE USUARIO Y ROLES
-- ----------------------------------------------------------
-- Roles: 'designer' (genera imagenes), 'writer' (edita texto),
--        'approver' (aprueba contenido final), 'admin' (todo)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'writer' check (role in ('designer', 'writer', 'approver', 'admin')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'writer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------
-- 2. PROYECTOS (agrupan una pieza de contenido + historial + comentarios)
-- ----------------------------------------------------------
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'Proyecto sin titulo',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------
-- 3. IMAGENES GENERADAS (Galeria)
-- ----------------------------------------------------------
create table if not exists images (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  prompt text not null,
  style text default 'ninguno',
  image_url text not null,
  flagged boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------
-- 4. HISTORIAL DE VERSIONES DE CONTENIDO
-- ----------------------------------------------------------
create table if not exists content_versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  content text not null,
  operation text not null,
  version_number int not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------
-- 5. COMENTARIOS (colaboracion y retroalimentacion)
-- ----------------------------------------------------------
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ----------------------------------------------------------
alter table profiles enable row level security;
alter table projects enable row level security;
alter table images enable row level security;
alter table content_versions enable row level security;
alter table comments enable row level security;

create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "projects_select_all" on projects for select using (auth.role() = 'authenticated');
create policy "projects_insert_all" on projects for insert with check (auth.role() = 'authenticated');

create policy "images_select_all" on images for select using (auth.role() = 'authenticated');
create policy "images_insert_own" on images for insert with check (auth.uid() = user_id);

create policy "versions_select_all" on content_versions for select using (auth.role() = 'authenticated');
create policy "versions_insert_own" on content_versions for insert with check (auth.uid() = user_id);

create policy "comments_select_all" on comments for select using (auth.role() = 'authenticated');
create policy "comments_insert_own" on comments for insert with check (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 7. STORAGE
-- ----------------------------------------------------------
-- Crear manualmente desde el dashboard de Supabase:
-- Storage > New bucket > "generated-images" > Public bucket: ON
