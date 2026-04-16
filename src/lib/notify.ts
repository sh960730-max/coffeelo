import { supabase } from './supabase'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`

async function sendPush(token: string, title: string, body: string, data?: Record<string, string>) {
  try {
    await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token, title, body, data }),
    })
  } catch (e) {
    console.error('push error:', e)
  }
}

/** 기사에게 알림 */
export async function notifyDriver(driverId: string, title: string, body: string, data?: Record<string, string>) {
  const db = supabase as any
  const { data: driver } = await db.from('drivers').select('fcm_token').eq('id', driverId).single()
  if (driver?.fcm_token) await sendPush(driver.fcm_token, title, body, data)
}

/** 점주에게 알림 */
export async function notifyCafe(cafeId: string, title: string, body: string, data?: Record<string, string>) {
  const db = supabase as any
  const { data: cafe } = await db.from('cafes').select('fcm_token').eq('id', cafeId).single()
  if (cafe?.fcm_token) await sendPush(cafe.fcm_token, title, body, data)
}

/** 관리자에게 알림 */
export async function notifyCompany(companyName: string, title: string, body: string, data?: Record<string, string>) {
  const db = supabase as any
  const { data: companies } = await db.from('companies').select('fcm_token').eq('name', companyName)
  for (const c of companies ?? []) {
    if (c.fcm_token) await sendPush(c.fcm_token, title, body, data)
  }
}
