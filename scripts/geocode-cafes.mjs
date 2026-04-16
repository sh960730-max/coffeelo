import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ysofjeniptffnxfrddns.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2ZqZW5pcHRmZm54ZnJkZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzg2NjksImV4cCI6MjA4ODk1NDY2OX0.Ou51cYwBSuF5YIDjSHwX7TA_5YneYIGlzFtkXrlt8O8'
const KAKAO_KEY = 'a3f09eff33809232229b9b0bcf24e63a'

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

async function geocode(address) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } }
    )
    const json = await res.json()
    const doc = json?.documents?.[0]
    if (doc) return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) }
  } catch (e) {
    console.error('geocode error:', e)
  }
  return null
}

async function main() {
  // lat/lng 없는 승인된 카페 조회
  const { data: cafes, error } = await db
    .from('cafes')
    .select('id, name, address')
    .eq('status', 'APPROVED')
    .or('lat.is.null,lng.is.null')

  if (error) { console.error('조회 오류:', error); return }
  console.log(`좌표 없는 카페 ${cafes.length}개 발견\n`)

  let success = 0, fail = 0
  for (let i = 0; i < cafes.length; i++) {
    const cafe = cafes[i]
    process.stdout.write(`[${i+1}/${cafes.length}] ${cafe.name} (${cafe.address}) ... `)

    const coords = await geocode(cafe.address)
    if (coords) {
      await db.from('cafes').update({ lat: coords.lat, lng: coords.lng }).eq('id', cafe.id)
      console.log(`✅ (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`)
      success++
    } else {
      console.log('❌ 실패')
      fail++
    }

    if (i < cafes.length - 1) await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n완료: 성공 ${success}개, 실패 ${fail}개`)
}

main()
