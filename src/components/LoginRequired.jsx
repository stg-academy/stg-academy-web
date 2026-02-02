import { startKakaoLogin } from '../config/kakao'

const LoginRequired = () => {
  const handleLogin = () => {
    try {
      startKakaoLogin()
    } catch (error) {
      console.error('카카오 로그인 시작 실패:', error)
      alert(error.message || '로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 md:px-6 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            로그인이 필요합니다
          </h2>

          <p className="text-gray-600 mb-8">
            대시보드를 이용하시려면 먼저 로그인해 주세요.
            <br />
            카카오 계정으로 간편하게 시작할 수 있습니다.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full bg-yellow-400 text-amber-900 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              카카오로 로그인
            </button>

            <p className="text-xs text-gray-500">
              로그인하시면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
            </p>
          </div>

          {/* 기능 미리보기 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">로그인 후 이용 가능한 기능:</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>실시간 대시보드 모니터링</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>개인화된 통계 및 리포트</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>작업 관리 및 협업 도구</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginRequired