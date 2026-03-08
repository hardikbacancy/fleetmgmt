export type Role = 'super_admin' | 'fleet_owner' | 'dispatcher'
export type FleetOwnerStatus = 'pending' | 'active' | 'inactive'
export type VehicleStatus = 'active' | 'inactive' | 'maintenance'
export type VehicleType = 'sedan' | 'suv' | 'hatchback' | 'minivan'
export type DriverStatus = 'active' | 'inactive' | 'on_trip'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type TripStatus = 'in_progress' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'online'
export type ExpenseCategory = 'fuel' | 'maintenance' | 'insurance' | 'salary' | 'tolls' | 'other'

export type ActionState = { error: string } | { success: true } | null

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  fleet_owner_id: string | null
  created_at: string
}

export interface FleetOwner {
  id: string
  user_id: string
  company_name: string
  phone: string
  address: string | null
  status: FleetOwnerStatus
  created_at: string
  profiles?: Profile
}

export interface Vehicle {
  id: string
  fleet_owner_id: string
  make: string
  model: string
  year: number
  plate_number: string
  type: VehicleType
  color: string
  status: VehicleStatus
  created_at: string
}

export interface Driver {
  id: string
  fleet_owner_id: string
  full_name: string
  phone: string
  email: string | null
  license_number: string
  license_expiry: string
  status: DriverStatus
  created_at: string
}

export interface Customer {
  id: string
  fleet_owner_id: string
  full_name: string
  phone: string
  email: string | null
  address: string | null
  created_at: string
}

export interface Booking {
  id: string
  fleet_owner_id: string
  customer_id: string | null
  driver_id: string | null
  vehicle_id: string | null
  pickup_address: string
  dropoff_address: string
  pickup_datetime: string
  fare_amount: number | null
  status: BookingStatus
  notes: string | null
  created_at: string
  customers?: Customer
  drivers?: Driver
  vehicles?: Vehicle
}

export interface Trip {
  id: string
  booking_id: string | null
  fleet_owner_id: string
  driver_id: string
  vehicle_id: string
  customer_id: string | null
  pickup_address: string
  dropoff_address: string
  started_at: string
  completed_at: string | null
  distance_km: number | null
  fare_amount: number
  payment_method: PaymentMethod
  status: TripStatus
  notes: string | null
  created_at: string
  drivers?: Driver
  vehicles?: Vehicle
  customers?: Customer
}

export interface Expense {
  id: string
  fleet_owner_id: string
  category: ExpenseCategory
  amount: number
  description: string
  date: string
  vehicle_id: string | null
  driver_id: string | null
  created_at: string
  vehicles?: Vehicle
  drivers?: Driver
}
