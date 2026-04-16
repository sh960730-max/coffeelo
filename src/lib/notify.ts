import { supabase } from './supabase'

// Supabase anon key — 공개 키이므로 하드코딩 안전 (브라우저 번들에 항상 포함됨)
const SUPABASE_URL  = 'https://ysofjeniptffnxfrddns.supabase.co'
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2ZqZW5pcHRmZm54ZnJkZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzg2NjksImV4cCI6MjA4ODk1NDY2OX0.Ou51cYwBSuF5YIDjSHwX7TA_5YneYIGlzFtkXrlt8O8'
const EDGE_URL      = `${SUPABASE_URL}/functions/v1/send-notification`

async function callEdge(payload: object) {
  try {
    // 로그인 세션 토큰 우선 사용, 없으면 anon key 사용
    const { data: { session } } = await (supabase as any).auth.getSession()
    const token = session?.access_token ?? ANON_KEY

    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    console.log('[FCM] status:', res.status, '→ result:', JSON.stringify(result))
  } catch (e) {
    console.error('[FCM] push error:', e)
  }
}

/** 기사에게 알림 */
export async function notifyDriver(driverId: string, title: string, body: string, data?: Record<string, string>) {
  await callEdge({ driverId, title, body, data })
}

/** 점주에게 알림 */
export async function notifyCafe(cafeId: string, title: string, body: string, data?: Record<string, string>) {
  await callEdge({ cafeId, title, body, data })
}

/** 관리자에게 알림 */
export async function notifyCompany(companyName: string, title: string, body: string, data?: Record<string, string>) {
  await callEdge({ companyName, targetType: 'company', title, body, data })
}

/** 소속 기사 전체에게 알림 */
export async function notifyAllDrivers(companyName: string, title: string, body: string, data?: Record<string, string>) {
  await callEdge({ companyName, targetType: 'drivers', title, body, data })
}

/** 수거 신청 알림 - cafeId만으로 담당기사+관리자 동시 알림 (서버사이드 처리) */
export async function notifyPickupRequest(cafeId: string) {
  await callEdge({ pickupCafeId: cafeId })
}
