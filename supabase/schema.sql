-- ================================================================
-- FleetMgmt — Database Schema (Custom Auth — no Supabase Auth)
-- Run this FIRST in Supabase SQL Editor
-- ================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------
-- Auth / RBAC Tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE   -- 'super_admin', 'fleet_owner', 'dispatcher'
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
  -- e.g. 'manage_fleet_owners', 'manage_vehicles', 'manage_drivers',
  --      'manage_customers', 'manage_bookings', 'manage_trips',
  --      'manage_expenses', 'view_reports'
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id       INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID    REFERENCES public.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ----------------------------------------------------------------
-- Fleet Tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.fleet_owners (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT        NOT NULL,
  phone        TEXT        NOT NULL,
  address      TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'inactive')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID        PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email          TEXT        NOT NULL,
  full_name      TEXT        NOT NULL,
  role           TEXT        NOT NULL CHECK (role IN ('super_admin', 'fleet_owner', 'dispatcher')),
  fleet_owner_id UUID        REFERENCES public.fleet_owners(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_owner_id UUID        NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  make           TEXT        NOT NULL,
  model          TEXT        NOT NULL,
  year           INTEGER     NOT NULL,
  plate_number   TEXT        NOT NULL,
  type           TEXT        NOT NULL DEFAULT 'sedan'
                             CHECK (type IN ('sedan', 'suv', 'hatchback', 'minivan')),
  color          TEXT        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drivers (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_owner_id UUID        NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL,
  phone          TEXT        NOT NULL,
  email          TEXT,
  license_number TEXT        NOT NULL,
  license_expiry DATE        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'inactive', 'on_trip')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_owner_id UUID        NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL,
  phone          TEXT        NOT NULL,
  email          TEXT,
  address        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_owner_id  UUID          NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  customer_id     UUID          REFERENCES public.customers(id) ON DELETE SET NULL,
  driver_id       UUID          REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id      UUID          REFERENCES public.vehicles(id) ON DELETE SET NULL,
  pickup_address  TEXT          NOT NULL,
  dropoff_address TEXT          NOT NULL,
  pickup_datetime TIMESTAMPTZ   NOT NULL,
  fare_amount     NUMERIC(10,2),
  status          TEXT          NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trips (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id      UUID          REFERENCES public.bookings(id) ON DELETE SET NULL,
  fleet_owner_id  UUID          NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  driver_id       UUID          NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  vehicle_id      UUID          NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  customer_id     UUID          REFERENCES public.customers(id) ON DELETE SET NULL,
  pickup_address  TEXT          NOT NULL,
  dropoff_address TEXT          NOT NULL,
  started_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  distance_km     NUMERIC(8,2),
  fare_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method  TEXT          NOT NULL DEFAULT 'cash'
                                CHECK (payment_method IN ('cash', 'card', 'online')),
  status          TEXT          NOT NULL DEFAULT 'in_progress'
                                CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  fleet_owner_id UUID          NOT NULL REFERENCES public.fleet_owners(id) ON DELETE CASCADE,
  category       TEXT          NOT NULL
                               CHECK (category IN ('fuel','maintenance','insurance','salary','tolls','other')),
  amount         NUMERIC(10,2) NOT NULL,
  description    TEXT          NOT NULL,
  date           DATE          NOT NULL DEFAULT CURRENT_DATE,
  vehicle_id     UUID          REFERENCES public.vehicles(id) ON DELETE SET NULL,
  driver_id      UUID          REFERENCES public.drivers(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_owner  ON public.vehicles(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_drivers_fleet_owner   ON public.drivers(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_fleet_owner ON public.customers(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_fleet_owner  ON public.bookings(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup       ON public.bookings(pickup_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_trips_fleet_owner     ON public.trips(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_started_at      ON public.trips(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_fleet_owner  ON public.expenses(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user       ON public.user_roles(user_id);

-- ----------------------------------------------------------------
-- DB function: authenticate_user
-- Called from login action — returns profile info if creds valid
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.authenticate_user(p_email TEXT, p_password TEXT)
RETURNS TABLE(
  id             UUID,
  email          TEXT,
  full_name      TEXT,
  role           TEXT,
  fleet_owner_id UUID
)
LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT u.id, u.email, u.full_name, p.role, p.fleet_owner_id
  FROM public.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE u.email = p_email
    AND u.password_hash = crypt(p_password, u.password_hash)
$$;

-- ----------------------------------------------------------------
-- DB function: get user permissions
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT ARRAY_AGG(DISTINCT perm.name)
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions perm ON perm.id = rp.permission_id
  WHERE ur.user_id = p_user_id
$$;

-- ----------------------------------------------------------------
-- Disable RLS (auth is handled in application layer)
-- ----------------------------------------------------------------

ALTER TABLE public.users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_owners   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses       DISABLE ROW LEVEL SECURITY;
