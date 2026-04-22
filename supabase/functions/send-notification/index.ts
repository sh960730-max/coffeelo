import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { importPKCS8, SignJWT } from 'https://deno.land/x/jose@v5.2.3/index.ts'

const PROJECT_ID   = Deno.env.get('FCM_PROJECT_ID')!
const CLIENT_EMAIL = Deno.env.get('FCM_CLIENT_EMAIL')!
const PRIVATE_KEY  = Deno.env.get('FCM_PRIVATE_KEY')!

/* ── Supabase 서비스롤 DB 조회 ── */
async function dbSelect(table: string, filters: Record<string, string>, select = 'fcm_token'): Promise<any[]> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const params = new URLSearchParams({ select })
  for (const [k, v] of Object.entries(filters)) {
    params.set(k, `eq.${v}`)
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    console.error(`dbSelect error: ${res.status}`, await res.text())
    return []
  }
  return res.json()
}

/* ── private key PEM 복원 ── */
function buildPem(raw: string): string {
  if (raw.includes('-----BEGIN PRIVATE KEY-----')) {
    return raw.replace(/\\n/g, '\n')
  }
  const body = raw.replace(/\s+/g, '')
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? body
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`
}

/* ── Google OAuth2 액세스 토큰 발급 ── */
async function getAccessToken(): Promise<string> {
  const pem = buildPem(PRIVATE_KEY)
  const privateKey = await importPKCS8(pem, 'RS256')

  const now = Math.floor(Date.now() / 1000)
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`OAuth failed: ${JSON.stringify(data)}`)
  return data.access_token
}

/* ── FCM 단건 발송 ── */
async function sendFCM(token: string, title: string, body: string, data?: Record<string, string>) {
  const accessToken = await getAccessToken()

  // data에서 Android 채널 ID 추출 (FCM data 필드에는 문자열만 가능)
  const androidChannelId = data?.android_channel_id ?? 'notice'
  const deepLink = data?.link ?? null

  // FCM data 페이로드 (문자열 값만 허용)
  const fcmData: Record<string, string> = {}
  if (data) {
    for (const [k, v] of Object.entries(data)) {
      fcmData[k] = String(v)
    }
  }

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: fcmData,
          // ── Android 네이티브 설정 ──
          android: {
            notification: {
              channel_id: androidChannelId,   // Android 8+ 알림 채널
              icon: 'ic_notification',         // res/drawable/ic_notification
              color: '#2d9a4e',                // 에코 그린
              sound: 'default',
              ...(deepLink ? { click_action: 'OPEN_DEEP_LINK' } : {}),
            },
            ...(deepLink ? {
              data: { ...fcmData, link: deepLink },
            } : {}),
          },
          // ── 웹 푸시 설정 ──
          webpush: {
            notification: {
              title, body,
              icon: 'https://smartecosys.kr/icons/icon-192.png',
            },
            ...(deepLink ? {
              fcm_options: { link: `https://app.smartecosys.kr${deepLink}` },
            } : {}),
          },
        },
      }),
    }
  )
  return res.json()
}

/* ── 토큰 목록으로 일괄 발송 ── */
async function sendToTokens(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  const unique = [...new Set(tokens.filter(Boolean))]
  if (unique.length === 0) return { sent: 0, results: [] }
  const results = await Promise.all(unique.map(t => sendFCM(t, title, body, data)))
  return { sent: unique.length, results }
}

/* ── 엔트리포인트 ── */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  try {
    const payload = await req.json()
    const { title, body, data } = payload

    let result: any

    if (payload.token) {
      /* 직접 토큰으로 발송 */
      result = await sendFCM(payload.token, title, body, data)

    } else if (payload.driverId) {
      /* 특정 기사 */
      const rows = await dbSelect('drivers', { id: payload.driverId })
      const token = rows[0]?.fcm_token
      result = token ? await sendFCM(token, title, body, data) : { skipped: 'no fcm_token' }

    } else if (payload.pickupCafeId) {
      /* 수거 신청 알림: cafeId → 담당기사 + 관리자 동시 알림 */
      const cafes = await dbSelect('cafes', { id: payload.pickupCafeId }, 'name,company,driver_id,fcm_token')
      const cafe = cafes[0]
      if (!cafe) {
        result = { skipped: 'cafe not found' }
      } else {
        const cafeName = cafe.name ?? '매장'
        // 중복 토큰 방지: 수신자별 { token, title, body } 구성
        const notifications: { token: string; title: string; body: string }[] = []
        const seen = new Set<string>()

        const addNotif = (token: string, title: string, body: string) => {
          // 같은 토큰+타이틀 조합이면 중복 제거
          const key = `${token}::${title}`
          if (token && !seen.has(key)) {
            seen.add(key)
            notifications.push({ token, title, body })
          }
        }

        // 점주 본인에게 신청 확인 알림
        if (cafe.fcm_token) {
          addNotif(cafe.fcm_token, '수거 신청 완료 ✅', `${cafeName} 수거가 접수되었습니다. 기사 배정을 기다려주세요.`)
        }

        // 담당 기사에게 알림
        if (cafe.driver_id) {
          const drivers = await dbSelect('drivers', { id: cafe.driver_id })
          const driverToken = drivers[0]?.fcm_token
          if (driverToken) {
            addNotif(driverToken, '새 수거 콜 🚛', `${cafeName} 수거 요청이 들어왔습니다!`)
          }
        }

        // 관리자에게 알림
        if (cafe.company) {
          const companies = await dbSelect('companies', { name: cafe.company })
          for (const c of companies ?? []) {
            if (c.fcm_token) addNotif(c.fcm_token, '새 수거 신청 ☕', `${cafeName}에서 수거를 신청했습니다.`)
          }
        }

        // 수거 신청 알림: 기사는 홈(콜 목록), 점주/관리자는 수거내역으로
        const pickupCafeData: Record<string, string> = {
          link: '/driver',
          android_channel_id: 'new_pickup_call',
        }
        const results = await Promise.all(notifications.map(n => {
          const isDriver = cafe.driver_id && n.token !== cafe.fcm_token &&
            !n.token.startsWith('company-')  // 기사 토큰인지 판별은 알림 수신자로 구분
          // 기사 알림에는 driver 딥링크, 점주/관리자는 cafe/history 딥링크
          const d = n.title.includes('새 수거 콜')
            ? { link: '/driver', android_channel_id: 'new_pickup_call' }
            : n.title.includes('수거 신청 완료')
            ? { link: '/cafe/history', android_channel_id: 'pickup_assign' }
            : { link: '/company/pickups', android_channel_id: 'notice' }
          return sendFCM(n.token, n.title, n.body, d)
        }))
        result = { sent: results.length, fcm: results }
      }

    } else if (payload.cafeId) {
      /* 특정 점주에게 직접 알림 */
      const rows = await dbSelect('cafes', { id: payload.cafeId })
      const token = rows[0]?.fcm_token
      result = token ? await sendFCM(token, title, body, data) : { skipped: 'no fcm_token' }

    } else if (payload.companyName && payload.targetType === 'company') {
      /* 관리자 전체 */
      const rows = await dbSelect('companies', { name: payload.companyName })
      const tokens = rows.map((r: any) => r.fcm_token)
      result = await sendToTokens(tokens, title, body, data)

    } else if (payload.companyName && payload.targetType === 'drivers') {
      /* 소속 기사 전체 */
      const rows = await dbSelect('drivers', { company: payload.companyName, status: 'APPROVED' })
      const tokens = rows.map((r: any) => r.fcm_token)
      result = await sendToTokens(tokens, title, body, data)

    } else {
      return new Response(JSON.stringify({ error: 'invalid payload' }), { status: 400 })
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    console.error('send-notification error:', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
