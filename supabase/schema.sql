-- ================================================================
-- FleetMgmt — Database Schema
-- Run this FIRST in Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.fleet_owners (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT        NOT NULL,
  phone        TEXT        NOT NULL,
  address      TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'inactive')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_owner ON public.vehicles(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_drivers_fleet_owner  ON public.drivers(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_fleet_owner ON public.customers(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_fleet_owner  ON public.bookings(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup       ON public.bookings(pickup_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_trips_fleet_owner     ON public.trips(fleet_owner_id);
CREATE INDEX IF NOT EXISTS idx_trips_started_at      ON public.trips(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_fleet_owner  ON public.expenses(fleet_owner_id);

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------

ALTER TABLE public.fleet_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses     ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER — bypass RLS for lookups)
CREATE OR REPLACE FUNCTION public.get_my_fleet_owner_id()
RETURNS UUID LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT fleet_owner_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
$$;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_super_admin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- fleet_owners
CREATE POLICY "fleet_owners_select_own"   ON public.fleet_owners FOR SELECT
  USING (id = public.get_my_fleet_owner_id() OR public.is_super_admin());
CREATE POLICY "fleet_owners_insert"       ON public.fleet_owners FOR INSERT WITH CHECK (true);
CREATE POLICY "fleet_owners_update_admin" ON public.fleet_owners FOR UPDATE
  USING (public.is_super_admin() OR id = public.get_my_fleet_owner_id());

-- Fleet data tables — scoped to fleet_owner_id
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['vehicles','drivers','customers','bookings','trips','expenses'] LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL
       USING (fleet_owner_id = public.get_my_fleet_owner_id() OR public.is_super_admin())
       WITH CHECK (fleet_owner_id = public.get_my_fleet_owner_id() OR public.is_super_admin())',
      t || '_policy', t
    );
  END LOOP;
END $$;
