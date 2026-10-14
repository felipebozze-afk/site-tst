create extension if not exists pgcrypto;
create type public.user_role as enum ('admin','manager','operator','viewer');
create type public.movement_type as enum ('entry','exit','adjustment');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,full_name text not null,role public.user_role not null default 'operator',created_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(),name text not null unique,description text,created_at timestamptz not null default now());
create table public.suppliers (id uuid primary key default gen_random_uuid(),name text not null,document text,email text,phone text,created_at timestamptz not null default now());
create table public.storage_locations (id uuid primary key default gen_random_uuid(),name text not null unique,description text,created_at timestamptz not null default now());
create table public.products (id uuid primary key default gen_random_uuid(),sku text not null unique,name text not null,description text,category_id uuid references public.categories(id) on delete set null,supplier_id uuid references public.suppliers(id) on delete set null,location_id uuid references public.storage_locations(id) on delete set null,quantity integer not null default 0 check(quantity>=0),minimum_quantity integer not null default 0 check(minimum_quantity>=0),unit_price numeric(12,2) not null default 0 check(unit_price>=0),expiry_date date,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.movements (id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id),user_id uuid references public.profiles(id) on delete set null,type public.movement_type not null,quantity integer not null check(quantity>0),reason text,reference text,created_at timestamptz not null default now());
create index movements_product_date_idx on public.movements(product_id,created_at desc);
create or replace function public.apply_stock_movement() returns trigger language plpgsql security definer set search_path=public as $$ begin if new.type='entry' then update products set quantity=quantity+new.quantity,updated_at=now() where id=new.product_id; elsif new.type='exit' then update products set quantity=quantity-new.quantity,updated_at=now() where id=new.product_id and quantity>=new.quantity; if not found then raise exception 'Estoque insuficiente'; end if; else update products set quantity=new.quantity,updated_at=now() where id=new.product_id; end if; return new; end; $$;
create trigger movement_updates_stock after insert on public.movements for each row execute function public.apply_stock_movement();
alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.suppliers enable row level security; alter table public.storage_locations enable row level security; alter table public.products enable row level security; alter table public.movements enable row level security;
create policy "authenticated read profiles" on profiles for select to authenticated using(true);
create policy "authenticated read categories" on categories for select to authenticated using(true);
create policy "authenticated read suppliers" on suppliers for select to authenticated using(true);
create policy "authenticated read locations" on storage_locations for select to authenticated using(true);
create policy "authenticated read products" on products for select to authenticated using(true);
create policy "authenticated read movements" on movements for select to authenticated using(true);
create policy "authenticated create movements" on movements for insert to authenticated with check(user_id=auth.uid());
create view public.low_stock_products as select id,sku,name,quantity,minimum_quantity from public.products where active and quantity<=minimum_quantity;
-- Helper com privilégio controlado evita recursão das policies em profiles.
create or replace function public.current_role() returns public.user_role
language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid()
$$;
create policy "managers manage categories" on public.categories for all to authenticated using(public.current_role() in ('admin','manager')) with check(public.current_role() in ('admin','manager'));
create policy "managers manage suppliers" on public.suppliers for all to authenticated using(public.current_role() in ('admin','manager')) with check(public.current_role() in ('admin','manager'));
create policy "managers manage locations" on public.storage_locations for all to authenticated using(public.current_role() in ('admin','manager')) with check(public.current_role() in ('admin','manager'));
create policy "managers manage products" on public.products for all to authenticated using(public.current_role() in ('admin','manager')) with check(public.current_role() in ('admin','manager'));
drop policy "authenticated create movements" on public.movements;
create policy "operators create movements" on public.movements for insert to authenticated with check(user_id=auth.uid() and public.current_role() in ('admin','manager','operator'));
