import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const PROJECT_ID   = Deno.env.get('FCM_PROJECT_ID')!
const CLIENT_EMAIL = Deno.env.get('FCM_CLIENT_EMAIL')!
const PRIVATE_KEY  = Deno.env.get('FCM_PRIVATE_KEY')!.replace(/\\n/g, '\n')

/* ── JWT 생성 (서비스 계정 → Google OAuth2 액세스 토큰) ── */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header  = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss:  CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:  'https://oauth2.googleapis.com/token',
    iat:  now,
    exp:  now + 3600,
  }

  const enc = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const signingInput = `${enc(header)}.${enc(payload)}`

  const keyData = PRIVATE_KEY
    .replace('-----BEGIN PRIVATE KEY-----\n', '')
    .replace('\n-----END PRIVATE KEY-----\n', '')
    .replace(/\n/g, '')

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signingInput}.${encodedSig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const data = await res.json()
  return data.access_token
}

/* ── FCM 발송 ── */
async function sendFCM(token: string, title: string, body: string, data?: Record<string, string>) {
  const accessToken = await getAccessToken()
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
          data: data ?? {},
          webpush: {
            notification: {
              title, body,
              icon: 'https://smartecosys.kr/icons/icon-192.png',
            },
          },
        },
      }),
    }
  )
  return res.json()
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
    const { token, title, body, data } = await req.json()
    if (!token) return new Response(JSON.stringify({ error: 'token required' }), { status: 400 })

    const result = await sendFCM(token, title, body, data)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
