const API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string

export async function geocodeKakao(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || !API_KEY) return null
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${API_KEY}` } }
    )
    const json = await res.json()
    const doc = json?.documents?.[0]
    if (doc) {
      return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) }
    }
  } catch (e) {
    console.error('kakao geocode error:', e)
  }
  return null
}
