export default function PublicAccountDeletePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">계정 삭제 안내</h1>
        <p className="text-sm text-gray-500 mb-8">커피로(Coffee LO) 앱</p>

        <p className="text-sm text-gray-700 mb-8 leading-relaxed">
          커피로 앱 이용자는 언제든지 본인의 계정과 관련 데이터를 삭제하도록 요청할 수 있습니다.
          아래 두 가지 방법 중 편한 방법을 선택하여 진행해 주세요.
        </p>

        {[
          {
            title: '방법 1. 앱 내에서 직접 탈퇴하기 (권장)',
            content: `1) 커피로 앱에 로그인합니다.\n2) 하단 탭의 "더보기" 메뉴로 이동합니다.\n3) 화면 하단의 "회원 탈퇴" 버튼을 누릅니다.\n4) 안내 문구 확인 후 "탈퇴하기"를 누르면 즉시 계정이 삭제됩니다.`,
          },
          {
            title: '방법 2. 이메일로 삭제 요청하기',
            content: `앱 로그인이 어려운 경우, 아래 이메일로 계정 삭제를 요청해 주시면 영업일 기준 7일 이내에 처리해 드립니다.\n\n• 이메일: sh960730@smartecosys.kr\n• 전화: 02-6925-2927\n\n요청 시 아래 정보를 포함해 주세요.\n• 가입하신 역할(기사 / 점주 / 관리자)\n• 로그인에 사용한 ID(전화번호)\n• 삭제 요청 사유(선택)`,
          },
          {
            title: '삭제되는 데이터',
            content: `계정 삭제 시 아래 데이터가 영구 삭제됩니다.\n• 이름, 연락처, 이메일 등 개인 식별 정보\n• 프로필 이미지\n• 알림 수신용 기기 식별자(FCM 토큰)\n• 앱 사용 활동 기록(로그인 이력 등)`,
          },
          {
            title: '보관되는 데이터 및 보관 기간',
            content: `관련 법령에 따라 아래 정보는 일정 기간 보관 후 파기됩니다.\n• 전자상거래법에 따른 거래·정산 기록: 5년\n• 소비자 불만 및 분쟁 처리 기록: 3년\n• 수거 이력(사진·중량 등 운영 기록): 3년\n\n보관되는 기록은 개인 식별 정보가 분리·비식별화된 형태로 처리되며, 법적 의무 이행 외 다른 용도로 사용되지 않습니다.`,
          },
          {
            title: '유의사항',
            content: `• 계정 삭제는 되돌릴 수 없습니다. 한 번 삭제된 계정과 데이터는 복구가 불가능합니다.\n• 미정산 금액이 있는 경우 정산 완료 후 삭제를 권장드립니다.\n• 삭제 완료 후 동일한 전화번호로 재가입할 수 있습니다.`,
          },
          {
            title: '문의',
            content: `계정 삭제와 관련한 문의는 아래로 연락주시기 바랍니다.\n\n• 담당자: 개인정보보호팀\n• 이메일: sh960730@smartecosys.kr\n• 전화: 02-6925-2927`,
          },
        ].map(({ title, content }) => (
          <div key={title} className="mb-7">
            <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
          </div>
        ))}

        <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
          © 2025 스마트에코시스 · <a href="https://smartecosys.kr" className="underline">smartecosys.kr</a> · <a href="/privacy" className="underline">개인정보 처리방침</a>
        </div>
      </div>
    </div>
  )
}
