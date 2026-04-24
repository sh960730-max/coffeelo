const EDGE_URL = 'https://ysofjeniptffnxfrddns.supabase.co/functions/v1/send-notification'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2ZqZW5pcHRmZm54ZnJkZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzg2NjksImV4cCI6MjA4ODk1NDY2OX0.Ou51cYwBSuF5YIDjSHwX7TA_5YneYIGlzFtkXrlt8O8'

async function callEdge(payload: object) {
  try {
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    console.log('[알림]', res.status, result)
  } catch (e) {
    console.error('[FCM] error:', e)
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

/** 수거 신청 알림 - cafeId만으로 담당기사+관리자 동시 알림 */
export async function notifyPickupRequest(cafeId: string) {
  await callEdge({ pickupCafeId: cafeId })
}
