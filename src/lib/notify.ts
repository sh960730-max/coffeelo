import { supabase } from './supabase'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`

async function callEdge(payload: object) {
  try {
    // 로그인된 사용자의 세션 토큰 사용 (없으면 anon key 폴백)
    const { data: { session } } = await (supabase as any).auth.getSession()
    const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY

    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    console.log('[FCM] payload:', JSON.stringify(payload), '→ result:', JSON.stringify(result))
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
