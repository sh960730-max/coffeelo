/* Supabase 미연결 시 사용하는 더미 데이터 */
import type { Driver, Cafe, Pickup, Container, WeighIn, Settlement, Announcement } from './database.types'

export const dummyDriver: Driver = {
  id: 'd0000001-0000-0000-0000-000000000001',
  auth_id: 'auth-dummy',
  phone: '01012345678',
  name: '박민수',
  company: '그린물류',
  truck_type: '1톤 트럭',
  license_plate: '12가 3456',
  profile_photo: null,
  is_online: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const dummyCafes: Cafe[] = [
  { id: 'c1', name: '스타벅스 강남역점', store_type: 'STARBUCKS', address: '서울 강남구 강남대로 396', phone: '02-1234-5001', lat: 37.4979, lng: 127.0276, created_at: new Date().toISOString() },
  { id: 'c2', name: '스타벅스 역삼역점', store_type: 'STARBUCKS', address: '서울 강남구 역삼로 180', phone: '02-1234-5002', lat: 37.5007, lng: 127.0365, created_at: new Date().toISOString() },
  { id: 'c3', name: '블루보틀 삼성점', store_type: 'FRANCHISE', address: '서울 강남구 테헤란로 521', phone: '02-1234-5003', lat: 37.5085, lng: 127.0632, created_at: new Date().toISOString() },
  { id: 'c4', name: '스타벅스 선릉역점', store_type: 'STARBUCKS', address: '서울 강남구 선릉로 525', phone: '02-1234-5004', lat: 37.5045, lng: 127.0499, created_at: new Date().toISOString() },
  { id: 'c5', name: '커피랑도서관 서초점', store_type: 'INDIVIDUAL', address: '서울 서초구 서초대로 301', phone: '02-1234-5005', lat: 37.4916, lng: 127.0072, created_at: new Date().toISOString() },
]

const today = new Date().toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString()

export const dummyPickups: Pickup[] = [
  { id: 'p1', driver_id: dummyDriver.id, cafe_id: 'c1', status: 'ARRIVED', requested_at: today, arrived_at: today, completed_at: null, overall_photo_url: null, total_weight: null, settlement_amount: null, note: null, weigh_in_id: null, created_at: today, updated_at: today, cafe: dummyCafes[0], containers: [] },
  { id: 'p2', driver_id: dummyDriver.id, cafe_id: 'c2', status: 'ASSIGNED', requested_at: today, arrived_at: null, completed_at: null, overall_photo_url: null, total_weight: null, settlement_amount: null, note: null, weigh_in_id: null, created_at: today, updated_at: today, cafe: dummyCafes[1], containers: [] },
  { id: 'p3', driver_id: dummyDriver.id, cafe_id: 'c3', status: 'ASSIGNED', requested_at: today, arrived_at: null, completed_at: null, overall_photo_url: null, total_weight: null, settlement_amount: null, note: null, weigh_in_id: null, created_at: today, updated_at: today, cafe: dummyCafes[2], containers: [] },
  // 완료된 수거
  { id: 'p4', driver_id: dummyDriver.id, cafe_id: 'c4', status: 'COMPLETED', requested_at: yesterday, arrived_at: yesterday, completed_at: yesterday, overall_photo_url: 'photo.jpg', total_weight: 45, settlement_amount: 3600, note: null, weigh_in_id: null, created_at: yesterday, updated_at: yesterday, cafe: dummyCafes[3], containers: [
    { id: 'ct1', pickup_id: 'p4', type: 'BOX', weight: 25, photo_url: null, sequence: 1, created_at: yesterday },
    { id: 'ct2', pickup_id: 'p4', type: 'BOX', weight: 20, photo_url: null, sequence: 2, created_at: yesterday },
  ]},
  { id: 'p5', driver_id: dummyDriver.id, cafe_id: 'c1', status: 'COMPLETED', requested_at: yesterday, arrived_at: yesterday, completed_at: yesterday, overall_photo_url: 'photo.jpg', total_weight: 75, settlement_amount: 6000, note: null, weigh_in_id: null, created_at: yesterday, updated_at: yesterday, cafe: dummyCafes[0], containers: [
    { id: 'ct3', pickup_id: 'p5', type: 'BOX', weight: 30, photo_url: null, sequence: 1, created_at: yesterday },
    { id: 'ct4', pickup_id: 'p5', type: 'BOX', weight: 25, photo_url: null, sequence: 2, created_at: yesterday },
    { id: 'ct5', pickup_id: 'p5', type: 'BOX', weight: 20, photo_url: null, sequence: 3, created_at: yesterday },
  ]},
  { id: 'p6', driver_id: dummyDriver.id, cafe_id: 'c5', status: 'COMPLETED', requested_at: twoDaysAgo, arrived_at: twoDaysAgo, completed_at: twoDaysAgo, overall_photo_url: 'photo.jpg', total_weight: 18, settlement_amount: 1440, note: null, weigh_in_id: null, created_at: twoDaysAgo, updated_at: twoDaysAgo, cafe: dummyCafes[4], containers: [
    { id: 'ct6', pickup_id: 'p6', type: 'BAG', weight: 10, photo_url: null, sequence: 1, created_at: twoDaysAgo },
    { id: 'ct7', pickup_id: 'p6', type: 'BAG', weight: 8, photo_url: null, sequence: 2, created_at: twoDaysAgo },
  ]},
]

export const dummyWeighIns: WeighIn[] = [
  { id: 'w1', driver_id: dummyDriver.id, date: yesterday, loaded_weight: 2850, empty_weight: 1600, net_weight: 1250, loaded_photo_url: null, empty_photo_url: null, status: 'COMPLETED', created_at: yesterday, updated_at: yesterday },
  { id: 'w2', driver_id: dummyDriver.id, date: twoDaysAgo, loaded_weight: 2400, empty_weight: 1600, net_weight: 800, loaded_photo_url: null, empty_photo_url: null, status: 'COMPLETED', created_at: twoDaysAgo, updated_at: twoDaysAgo },
]

export const dummySettlements: Settlement[] = [
  { id: 's1', driver_id: dummyDriver.id, period_start: '2026-03-17T00:00:00Z', period_end: '2026-03-23T23:59:59Z', total_weight: 6730, rate_per_kg: 80, gross_amount: 538400, status: 'CONFIRMED', paid_at: null, created_at: yesterday, updated_at: yesterday },
  { id: 's2', driver_id: dummyDriver.id, period_start: '2026-03-10T00:00:00Z', period_end: '2026-03-16T23:59:59Z', total_weight: 7200, rate_per_kg: 80, gross_amount: 576000, status: 'PAID', paid_at: '2026-03-18T10:00:00Z', created_at: twoDaysAgo, updated_at: twoDaysAgo },
  { id: 's3', driver_id: dummyDriver.id, period_start: '2026-03-03T00:00:00Z', period_end: '2026-03-09T23:59:59Z', total_weight: 5800, rate_per_kg: 80, gross_amount: 464000, status: 'PAID', paid_at: '2026-03-11T10:00:00Z', created_at: twoDaysAgo, updated_at: twoDaysAgo },
]

export const dummyAnnouncements: Announcement[] = [
  { id: 'a1', title: '앱 업데이트 안내', content: '커피로 v1.0이 출시되었습니다. 새로운 수거 확인 기능을 사용해 보세요.', is_active: true, created_at: yesterday },
  { id: 'a2', title: '설 연휴 수거 일정', content: '1월 28일~30일은 수거가 중단됩니다. 양해 부탁드립니다.', is_active: true, created_at: twoDaysAgo },
]
