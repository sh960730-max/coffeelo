/* Supabase 데이터베이스 타입 정의 */
export type StoreType = 'STARBUCKS' | 'FRANCHISE' | 'INDIVIDUAL'
export type PickupStatus = 'REQUESTED' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'LOADED' | 'COMPLETED' | 'CANCELLED'
export type ContainerType = 'BOX' | 'BAG'
export type WeighInStatus = 'IN_PROGRESS' | 'COMPLETED'
export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'DISPUTED'

export interface Driver {
  id: string
  auth_id: string
  phone: string
  name: string
  company: string
  truck_type: string
  license_plate: string | null
  profile_photo: string | null
  is_online: boolean
  created_at: string
  updated_at: string
}

export interface Cafe {
  id: string
  name: string
  store_type: StoreType
  address: string
  phone: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export interface Pickup {
  id: string
  driver_id: string
  cafe_id: string
  status: PickupStatus
  requested_at: string
  arrived_at: string | null
  completed_at: string | null
  overall_photo_url: string | null
  total_weight: number | null
  settlement_amount: number | null
  note: string | null
  weigh_in_id: string | null
  created_at: string
  updated_at: string
  /* joined */
  cafe?: Cafe
  containers?: Container[]
}

export interface Container {
  id: string
  pickup_id: string
  type: ContainerType
  weight: number
  photo_url: string | null
  sequence: number
  created_at: string
}

export interface WeighIn {
  id: string
  driver_id: string
  date: string
  loaded_weight: number | null
  empty_weight: number | null
  net_weight: number | null
  loaded_photo_url: string | null
  empty_photo_url: string | null
  status: WeighInStatus
  created_at: string
  updated_at: string
  /* joined */
  pickups?: Pickup[]
}

export interface Settlement {
  id: string
  driver_id: string
  period_start: string
  period_end: string
  total_weight: number
  rate_per_kg: number
  gross_amount: number
  status: SettlementStatus
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
}

/* Supabase generic Database type */
export interface Database {
  public: {
    Tables: {
      drivers: { Row: Driver; Insert: Partial<Driver>; Update: Partial<Driver> }
      cafes: { Row: Cafe; Insert: Partial<Cafe>; Update: Partial<Cafe> }
      pickups: { Row: Pickup; Insert: Partial<Pickup>; Update: Partial<Pickup> }
      containers: { Row: Container; Insert: Partial<Container>; Update: Partial<Container> }
      weigh_ins: { Row: WeighIn; Insert: Partial<WeighIn>; Update: Partial<WeighIn> }
      settlements: { Row: Settlement; Insert: Partial<Settlement>; Update: Partial<Settlement> }
      announcements: { Row: Announcement; Insert: Partial<Announcement>; Update: Partial<Announcement> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      store_type: StoreType
      pickup_status: PickupStatus
      container_type: ContainerType
      weigh_in_status: WeighInStatus
      settlement_status: SettlementStatus
    }
  }
}
