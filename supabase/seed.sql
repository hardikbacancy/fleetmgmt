-- ================================================================
-- FleetMgmt — Seed Data (Custom Auth)
-- Run this AFTER schema.sql in Supabase SQL Editor
-- Creates 3 users + roles/permissions + fleet demo data
-- ================================================================

DO $$
DECLARE
  -- Fixed UUIDs for users
  admin_uid      UUID := 'a0000001-0000-0000-0000-000000000001';
  owner_uid      UUID := 'b0000002-0000-0000-0000-000000000002';
  dispatcher_uid UUID := 'c0000003-0000-0000-0000-000000000003';

  -- Fleet owner company UUID
  fleet_id UUID := 'd0000004-0000-0000-0000-000000000004';

  -- Role IDs
  role_super_admin  INTEGER;
  role_fleet_owner  INTEGER;
  role_dispatcher   INTEGER;

  -- Permission IDs
  perm_manage_fleet_owners INTEGER;
  perm_manage_vehicles     INTEGER;
  perm_manage_drivers      INTEGER;
  perm_manage_customers    INTEGER;
  perm_manage_bookings     INTEGER;
  perm_manage_trips        INTEGER;
  perm_manage_expenses     INTEGER;
  perm_view_reports        INTEGER;

  -- Vehicles
  v1 UUID; v2 UUID; v3 UUID;
  -- Drivers
  d1 UUID; d2 UUID; d3 UUID;
  -- Customers
  c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
  -- Bookings
  b1 UUID; b4 UUID;

BEGIN

-- ----------------------------------------------------------------
-- Roles
-- ----------------------------------------------------------------
INSERT INTO public.roles (name) VALUES
  ('super_admin'),
  ('fleet_owner'),
  ('dispatcher')
ON CONFLICT (name) DO NOTHING;

SELECT id INTO role_super_admin FROM public.roles WHERE name = 'super_admin';
SELECT id INTO role_fleet_owner  FROM public.roles WHERE name = 'fleet_owner';
SELECT id INTO role_dispatcher   FROM public.roles WHERE name = 'dispatcher';

-- ----------------------------------------------------------------
-- Permissions
-- ----------------------------------------------------------------
INSERT INTO public.permissions (name) VALUES
  ('manage_fleet_owners'),
  ('manage_vehicles'),
  ('manage_drivers'),
  ('manage_customers'),
  ('manage_bookings'),
  ('manage_trips'),
  ('manage_expenses'),
  ('view_reports')
ON CONFLICT (name) DO NOTHING;

SELECT id INTO perm_manage_fleet_owners FROM public.permissions WHERE name = 'manage_fleet_owners';
SELECT id INTO perm_manage_vehicles     FROM public.permissions WHERE name = 'manage_vehicles';
SELECT id INTO perm_manage_drivers      FROM public.permissions WHERE name = 'manage_drivers';
SELECT id INTO perm_manage_customers    FROM public.permissions WHERE name = 'manage_customers';
SELECT id INTO perm_manage_bookings     FROM public.permissions WHERE name = 'manage_bookings';
SELECT id INTO perm_manage_trips        FROM public.permissions WHERE name = 'manage_trips';
SELECT id INTO perm_manage_expenses     FROM public.permissions WHERE name = 'manage_expenses';
SELECT id INTO perm_view_reports        FROM public.permissions WHERE name = 'view_reports';

-- ----------------------------------------------------------------
-- Role → Permission assignments
-- ----------------------------------------------------------------

-- super_admin: all permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  (role_super_admin, perm_manage_fleet_owners),
  (role_super_admin, perm_manage_vehicles),
  (role_super_admin, perm_manage_drivers),
  (role_super_admin, perm_manage_customers),
  (role_super_admin, perm_manage_bookings),
  (role_super_admin, perm_manage_trips),
  (role_super_admin, perm_manage_expenses),
  (role_super_admin, perm_view_reports)
ON CONFLICT DO NOTHING;

-- fleet_owner: everything except manage_fleet_owners
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  (role_fleet_owner, perm_manage_vehicles),
  (role_fleet_owner, perm_manage_drivers),
  (role_fleet_owner, perm_manage_customers),
  (role_fleet_owner, perm_manage_bookings),
  (role_fleet_owner, perm_manage_trips),
  (role_fleet_owner, perm_manage_expenses),
  (role_fleet_owner, perm_view_reports)
ON CONFLICT DO NOTHING;

-- dispatcher: same as fleet_owner
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
  (role_dispatcher, perm_manage_vehicles),
  (role_dispatcher, perm_manage_drivers),
  (role_dispatcher, perm_manage_customers),
  (role_dispatcher, perm_manage_bookings),
  (role_dispatcher, perm_manage_trips),
  (role_dispatcher, perm_manage_expenses),
  (role_dispatcher, perm_view_reports)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Users (password: 'password123' hashed with bcrypt via pgcrypto)
-- ----------------------------------------------------------------
INSERT INTO public.users (id, email, password_hash, full_name, created_at)
VALUES
  (admin_uid,      'admin@cabsaathi.test',   crypt('password123', gen_salt('bf')), 'Super Admin',  NOW() - INTERVAL '60 days'),
  (owner_uid,      'owner@cabsaathi.test',   crypt('password123', gen_salt('bf')), 'Rajesh Kumar', NOW() - INTERVAL '60 days'),
  (dispatcher_uid, 'dispatcher@example.com', crypt('password123', gen_salt('bf')), 'Priya Nair',   NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- User → Role assignments
-- ----------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role_id) VALUES
  (admin_uid,      role_super_admin),
  (owner_uid,      role_fleet_owner),
  (dispatcher_uid, role_dispatcher)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------
-- Fleet Owner record (active immediately for demo)
-- ----------------------------------------------------------------
INSERT INTO public.fleet_owners (id, user_id, company_name, phone, address, status, created_at)
VALUES (
  fleet_id, owner_uid,
  'Kumar Cabs Pvt Ltd', '+91 98765 43210',
  '12, Residency Road, Bengaluru, Karnataka 560025',
  'active',
  NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Profiles
-- ----------------------------------------------------------------
INSERT INTO public.profiles (id, email, full_name, role, fleet_owner_id, created_at)
VALUES
  (admin_uid,      'admin@cabsaathi.test',   'Super Admin',  'super_admin', NULL,     NOW() - INTERVAL '60 days'),
  (owner_uid,      'owner@cabsaathi.test',   'Rajesh Kumar', 'fleet_owner', fleet_id, NOW() - INTERVAL '60 days'),
  (dispatcher_uid, 'dispatcher@example.com', 'Priya Nair',   'dispatcher',  fleet_id, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- Vehicles
-- ----------------------------------------------------------------
INSERT INTO public.vehicles (fleet_owner_id, make, model, year, plate_number, type, color, status, created_at)
VALUES
  (fleet_id, 'Maruti Suzuki', 'Swift Dzire',   2022, 'KA01AB1234', 'sedan', 'White',  'active',      NOW() - INTERVAL '55 days'),
  (fleet_id, 'Honda',         'City',          2021, 'KA02CD5678', 'sedan', 'Silver', 'active',      NOW() - INTERVAL '50 days'),
  (fleet_id, 'Toyota',        'Innova Crysta', 2023, 'KA03EF9012', 'suv',   'Grey',   'maintenance', NOW() - INTERVAL '40 days')
;

SELECT id INTO v1 FROM public.vehicles WHERE plate_number = 'KA01AB1234' AND fleet_owner_id = fleet_id;
SELECT id INTO v2 FROM public.vehicles WHERE plate_number = 'KA02CD5678' AND fleet_owner_id = fleet_id;
SELECT id INTO v3 FROM public.vehicles WHERE plate_number = 'KA03EF9012' AND fleet_owner_id = fleet_id;

-- ----------------------------------------------------------------
-- Drivers
-- ----------------------------------------------------------------
INSERT INTO public.drivers (fleet_owner_id, full_name, phone, email, license_number, license_expiry, status, created_at)
VALUES
  (fleet_id, 'Ramesh Kumar', '+91 99001 12345', 'ramesh@driver.com', 'KA0120210012345', '2027-06-30', 'active',  NOW() - INTERVAL '50 days'),
  (fleet_id, 'Suresh Singh', '+91 99002 23456', NULL,                'KA0120190023456', '2026-03-15', 'active',  NOW() - INTERVAL '45 days'),
  (fleet_id, 'Mahesh Yadav', '+91 99003 34567', 'mahesh@driver.com', 'KA0120220034567', '2028-12-01', 'on_trip', NOW() - INTERVAL '35 days')
;

SELECT id INTO d1 FROM public.drivers WHERE phone = '+91 99001 12345' AND fleet_owner_id = fleet_id;
SELECT id INTO d2 FROM public.drivers WHERE phone = '+91 99002 23456' AND fleet_owner_id = fleet_id;
SELECT id INTO d3 FROM public.drivers WHERE phone = '+91 99003 34567' AND fleet_owner_id = fleet_id;

-- ----------------------------------------------------------------
-- Customers
-- ----------------------------------------------------------------
INSERT INTO public.customers (fleet_owner_id, full_name, phone, email, address, created_at)
VALUES
  (fleet_id, 'Anita Sharma', '+91 88001 11111', 'anita@example.com',  '14, Indiranagar, Bengaluru', NOW() - INTERVAL '45 days'),
  (fleet_id, 'Vikram Mehta', '+91 88002 22222', 'vikram@example.com', '56, Koramangala, Bengaluru', NOW() - INTERVAL '40 days'),
  (fleet_id, 'Deepa Reddy',  '+91 88003 33333', NULL,                 '8, Whitefield, Bengaluru',   NOW() - INTERVAL '30 days'),
  (fleet_id, 'Arun Pillai',  '+91 88004 44444', 'arun@example.com',   '22, JP Nagar, Bengaluru',    NOW() - INTERVAL '25 days'),
  (fleet_id, 'Sunita Joshi', '+91 88005 55555', 'sunita@example.com', '3, Malleshwaram, Bengaluru', NOW() - INTERVAL '20 days')
;

SELECT id INTO c1 FROM public.customers WHERE phone = '+91 88001 11111' AND fleet_owner_id = fleet_id;
SELECT id INTO c2 FROM public.customers WHERE phone = '+91 88002 22222' AND fleet_owner_id = fleet_id;
SELECT id INTO c3 FROM public.customers WHERE phone = '+91 88003 33333' AND fleet_owner_id = fleet_id;
SELECT id INTO c4 FROM public.customers WHERE phone = '+91 88004 44444' AND fleet_owner_id = fleet_id;
SELECT id INTO c5 FROM public.customers WHERE phone = '+91 88005 55555' AND fleet_owner_id = fleet_id;

-- ----------------------------------------------------------------
-- Bookings
-- ----------------------------------------------------------------
INSERT INTO public.bookings (fleet_owner_id, customer_id, driver_id, vehicle_id, pickup_address, dropoff_address, pickup_datetime, fare_amount, status, created_at)
VALUES
  (fleet_id, c1, d1, v1, '14 Indiranagar, Bengaluru',    'Kempegowda International Airport', NOW() + INTERVAL '2 hours', 850, 'confirmed', NOW() - INTERVAL '1 day'),
  (fleet_id, c2, d2, v2, '56 Koramangala, Bengaluru',    'Whitefield, Bengaluru',             NOW() + INTERVAL '5 hours', 450, 'pending',   NOW() - INTERVAL '4 hours'),
  (fleet_id, c3, NULL, NULL, '8 Whitefield, Bengaluru',  'MG Road, Bengaluru',                NOW() + INTERVAL '1 day',   300, 'pending',   NOW() - INTERVAL '2 hours'),
  (fleet_id, c4, d1, v1, '22 JP Nagar, Bengaluru',       'Electronic City, Bengaluru',        NOW() - INTERVAL '3 days',  500, 'confirmed', NOW() - INTERVAL '4 days'),
  (fleet_id, c5, d2, v2, '3 Malleshwaram, Bengaluru',    'Mysore Road Bus Stand, Bengaluru',  NOW() - INTERVAL '7 days',  650, 'cancelled', NOW() - INTERVAL '8 days')
;

SELECT id INTO b1 FROM public.bookings WHERE customer_id = c1 AND fleet_owner_id = fleet_id AND status = 'confirmed' AND fare_amount = 850;
SELECT id INTO b4 FROM public.bookings WHERE customer_id = c4 AND fleet_owner_id = fleet_id AND status = 'confirmed' AND fare_amount = 500;

-- ----------------------------------------------------------------
-- Trips
-- ----------------------------------------------------------------
INSERT INTO public.trips (fleet_owner_id, booking_id, driver_id, vehicle_id, customer_id,
  pickup_address, dropoff_address, started_at, completed_at, distance_km, fare_amount, payment_method, status)
VALUES
  (fleet_id, NULL, d1, v1, c1,
   '14 Indiranagar, Bengaluru', 'Kempegowda International Airport',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '90 minutes',
   32.5, 850, 'cash', 'completed'),
  (fleet_id, NULL, d2, v2, c2,
   '56 Koramangala, Bengaluru', 'Whitefield, Bengaluru',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '50 minutes',
   18.2, 450, 'online', 'completed'),
  (fleet_id, NULL, d1, v1, c3,
   '8 Whitefield, Bengaluru', 'MG Road, Bengaluru',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '40 minutes',
   15.8, 380, 'card', 'completed'),
  (fleet_id, b4, d3, v2, c4,
   '22 JP Nagar, Bengaluru', 'Electronic City, Bengaluru',
   NOW() - INTERVAL '30 minutes', NULL,
   NULL, 500, 'cash', 'in_progress')
;

-- ----------------------------------------------------------------
-- Expenses
-- ----------------------------------------------------------------
INSERT INTO public.expenses (fleet_owner_id, category, amount, description, date, vehicle_id, driver_id)
VALUES
  (fleet_id, 'fuel',        3200, 'Fuel refill — BPCL Koramangala',        CURRENT_DATE - 1,  v1,   NULL),
  (fleet_id, 'fuel',        2800, 'Fuel refill — HP Indiranagar',           CURRENT_DATE - 3,  v2,   NULL),
  (fleet_id, 'maintenance', 8500, 'Engine oil change + brake pads — Swift', CURRENT_DATE - 7,  v1,   NULL),
  (fleet_id, 'insurance',  15000, 'Annual insurance renewal — KA01AB1234',  CURRENT_DATE - 14, v1,   NULL),
  (fleet_id, 'salary',     18000, 'Monthly salary — Ramesh Kumar',          CURRENT_DATE - 1,  NULL, d1),
  (fleet_id, 'salary',     16000, 'Monthly salary — Suresh Singh',          CURRENT_DATE - 1,  NULL, d2),
  (fleet_id, 'tolls',        450, 'Toll charges — Airport run',             CURRENT_DATE - 2,  v1,   d1),
  (fleet_id, 'other',       1200, 'Car wash and cleaning — monthly',        CURRENT_DATE - 5,  NULL, NULL)
;

END $$;
