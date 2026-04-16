const EDGE_URL = 'https://ysofjeniptffnxfrddns.supabase.co/functions/v1/send-notification'

async function callEdge(payload: object) {
  try {
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    alert('[FCM응답]\n' + JSON.stringify(result).slice(0, 300))
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
