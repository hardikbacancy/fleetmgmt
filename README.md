# FleetMgmt — Fleet Management Platform

A production-ready Next.js 15 fleet management app for cab/taxi operators with multi-tenancy, role-based access, and full CRUD for vehicles, drivers, customers, bookings, trips, and expenses.

---

## Credentials (seed accounts)

| Role         | Email                     | Password     | Access |
|---|---|---|---|
| Super Admin  | admin@cabsaathi.test      | password123  | Full platform, manage fleet owners |
| Fleet Owner  | owner@cabsaathi.test      | password123  | Own fleet data only |
| Dispatcher   | dispatcher@example.com    | password123  | Same as fleet owner (linked to Kumar Cabs) |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Styling | Tailwind CSS, @heroicons/react |
| Auth & DB | Supabase (Postgres + Row Level Security) |
| Deployment | Vercel |

---

## Features

- **3 roles:** Super Admin, Fleet Owner, Dispatcher (multi-tenant)
- **Fleet Owner Registration** with pending → admin approval flow
- **Vehicles** — CRUD, types (Sedan/SUV/Hatchback/Minivan), status tracking
- **Drivers** — CRUD, license tracking, status (Active/On Trip/Inactive)
- **Customers** — CRUD with contact info
- **Bookings** — Create → Assign Driver/Vehicle → Confirm → Start Trip → Complete
- **Trips** — Real-time status, fare + km tracking, payment method
- **Expenses** — 6 categories (Fuel, Maintenance, Insurance, Salary, Tolls, Other)
- **Reports** — Revenue, P&L, trip breakdown, top drivers, expense charts
- **Admin Panel** — Approve/activate/deactivate fleet owners

---

## Setup

### 1. Create Supabase Project
Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run SQL
In Supabase Dashboard → **SQL Editor**, run files in order:
1. `supabase/schema.sql` — creates all tables, RLS policies, helper functions
2. `supabase/seed.sql` — creates 3 auth users + fleet demo data

### 3. Environment Variables
```bash
cp .env.local.example .env.local
```

Fill in from Supabase → **Project Settings → API**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> `SUPABASE_SERVICE_ROLE_KEY` is used by the `/api/register` endpoint to create new fleet owner accounts without email verification.

### 4. Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/login`.

---

## Deploy to Vercel

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add the 3 environment variables under **Settings → Environment Variables**
4. Deploy

---

## Architecture

### Route Groups
| Group | Routes | Who |
|---|---|---|
| `(auth)` | `/login`, `/register` | Public |
| `(admin)` | `/admin`, `/admin/fleet-owners` | Super Admin only |
| `(fleet)` | `/dashboard`, `/vehicles`, `/drivers`, `/customers`, `/bookings`, `/trips`, `/expenses`, `/reports` | Fleet Owner + Dispatcher |

### Multi-tenancy
Every fleet data table (`vehicles`, `drivers`, `customers`, `bookings`, `trips`, `expenses`) has a `fleet_owner_id` column. Both the RLS policies and server actions scope all queries to the logged-in user's `fleet_owner_id`.

### Booking → Trip Flow
```
New Booking (pending)
  └─ Assign Driver + Vehicle
  └─ Confirm Booking (confirmed)
      └─ Start Trip  →  Trip created (in_progress), driver = on_trip
          └─ Complete Trip (completed), driver = active, fare recorded
```

### Key Files
```
app/
├── (auth)/login       — Login with Supabase Auth
├── (auth)/register    — Fleet owner registration form
├── api/register       — API route: creates user + profile + fleet_owners (service role)
├── (admin)/           — Super admin panel
├── (fleet)/           — Fleet owner / dispatcher panel
└── actions/           — All server actions (auth, vehicles, drivers, customers, bookings, trips, expenses, admin)

components/
├── Sidebar.tsx        — Fleet sidebar (dark, collapsible on mobile)
├── AdminSidebar.tsx   — Admin sidebar
├── StatCard.tsx       — Dashboard metric cards
├── StatusBadge.tsx    — Status pills for all entity types
├── DeleteButton.tsx   — Inline delete with confirm
└── forms/             — VehicleForm, DriverForm, CustomerForm, BookingForm, ExpenseForm

lib/
├── auth.ts            — getProfile(), getFleetContext() helpers
├── types.ts           — All TypeScript interfaces
├── utils.ts           — formatDate, formatCurrency, cn
└── supabase/          — Browser + server Supabase clients

supabase/
├── schema.sql         — Tables, indexes, RLS, helper functions
└── seed.sql           — 3 auth users + full demo fleet data
```
