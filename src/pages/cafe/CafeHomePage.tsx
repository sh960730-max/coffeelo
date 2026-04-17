import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import PickupStatusCard from '../../components/PickupStatusCard'
import PickupRequestButton from '../../components/PickupRequestButton'
import CarbonDashboard from '../../components/CarbonDashboard'
import { getToken } from 'firebase/messaging'
import { getFirebaseMessaging } from '../../lib/firebase'

const VAPID_KEY = 'BHU0hNNSh23jSOmENa3RWJxJrRpU2-DKorqOG8M9-VrnCzeUmSVzVr1MLurtwhfkQvnWkM249LfqmLAg4Ny9I8Q'
const EDGE_URL = 'https://ysofjeniptffnxfrddns.supabase.co/functions/v1/send-notification'

async function sendTestNotif() {
  try {
    const messaging = await getFirebaseMessaging()
    if (!messaging) { alert('messaging null'); return }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (!token) { alert('token null'); return }
    alert('토큰: ' + token.slice(0, 30) + '...\n\n전송 중...')
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, title: '🔔 갤럭시 테스트', body: '이 알림이 오면 성공!' }),
    })
    const result = await res.json()
    alert('FCM 응답:\n' + JSON.stringify(result).slice(0, 200))
  } catch (e) {
    alert('오류: ' + String(e))
  }
}

export default function CafeHomePage() {
  return (
    <>
      <Header />
      <PickupStatusCard />
      <Link to="/cafe/request">
        <PickupRequestButton />
      </Link>
      {/* 임시 테스트 버튼 */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={sendTestNotif}
          style={{ width: '100%', padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}
        >
          🔔 알림 테스트 (갤럭시 자체 전송)
        </button>
      </div>
      <CarbonDashboard />
    </>
  )
}
