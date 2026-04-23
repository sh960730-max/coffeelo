export default function PublicPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보 처리방침</h1>
        <p className="text-sm text-gray-500 mb-8">시행일: 2025년 1월 1일</p>

        <p className="text-sm text-gray-700 mb-8 leading-relaxed">
          스마트에코시스(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
          본 방침은 커피로 앱(이하 "앱")을 통해 제공되는 서비스에 적용됩니다.
        </p>

        {[
          {
            title: '1. 수집하는 개인정보 항목',
            content: `• 이름, 연락처(전화번호), 이메일 주소\n• 차량 정보(차종, 번호판) — 기사 회원\n• 위치 정보 (수거 경로 확인 목적)\n• 수거 현장 사진 (카메라를 통해 직접 촬영)\n• 수거 이력, 정산 정보\n• 기기 식별자 (푸시 알림 발송 목적)`,
          },
          {
            title: '2. 개인정보 수집 목적',
            content: `• 커피 찌꺼기 수거 서비스 제공 및 수거 확인\n• 수거 현장 사진 촬영 및 기록 (품질 관리)\n• 정산 처리 및 이력 관리\n• 푸시 알림(FCM) 발송\n• 고객 지원 및 문의 응대\n• 서비스 개선 및 통계 분석`,
          },
          {
            title: '3. 카메라 권한 사용',
            content: `앱은 수거 완료 확인을 위해 카메라 권한을 사용합니다.\n• 사용 목적: 수거 현장 사진 촬영 (기사 회원 전용)\n• 촬영된 사진은 수거 기록으로 저장되며, 정산·분쟁 해결 목적으로만 활용됩니다.\n• 카메라 권한은 사용자의 명시적 동의 후에만 활성화됩니다.`,
          },
          {
            title: '4. 위치 정보 사용',
            content: `앱은 수거 지도 및 경로 확인을 위해 위치 권한(선택)을 요청할 수 있습니다.\n• 사용 목적: 수거 매장 위치 확인\n• 위치 정보는 앱 내에서만 사용되며 외부에 전송되지 않습니다.`,
          },
          {
            title: '5. 개인정보 보유 기간',
            content: `서비스 이용 종료 후 5년간 보관 후 파기합니다.\n단, 관련 법령에 의한 경우 해당 기간 동안 보관합니다.\n• 전자상거래법 상 거래 기록: 5년\n• 소비자 불만·분쟁 처리 기록: 3년`,
          },
          {
            title: '6. 개인정보 제3자 제공',
            content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.\n다만, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외입니다.`,
          },
          {
            title: '7. 개인정보 처리 위탁',
            content: `회사는 서비스 제공을 위해 다음 업체에 개인정보 처리를 위탁합니다.\n• Supabase Inc. — 데이터베이스 및 인증 서비스\n• Google Firebase — 푸시 알림(FCM) 서비스\n• Vercel Inc. — 웹 서비스 호스팅`,
          },
          {
            title: '8. 이용자의 권리',
            content: `이용자는 언제든지 자신의 개인정보에 대해 다음 권리를 행사할 수 있습니다.\n• 열람 요구\n• 정정·삭제 요구\n• 처리 정지 요구\n\n권리 행사는 아래 연락처로 문의 주시면 처리합니다.`,
          },
          {
            title: '9. 개인정보 보호책임자',
            content: `담당자: 개인정보보호팀\n이메일: sh960730@smartecosys.kr\n전화: 02-6925-2927`,
          },
          {
            title: '10. 방침 변경',
            content: `이 개인정보 처리방침은 법령·서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지 또는 본 페이지를 통해 안내합니다.`,
          },
        ].map(({ title, content }) => (
          <div key={title} className="mb-7">
            <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        ))}

        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
          © 2025 스마트에코시스 · <a href="https://smartecosys.kr" className="underline">smartecosys.kr</a>
        </div>
      </div>
    </div>
  )
}
