import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAuthCodeFromUrl, clearUrlParams } from '../config/kakao'

const KakaoCallback = () => {
  const { loginWithKakao } = useAuth()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState(null)

  useEffect(() => {
    let isHandled = false // 중복 실행 방지

    const handleCallback = async () => {
      if (isHandled) return
      isHandled = true

      try {
        setStatus('processing')

        // URL에서 인증 코드 추출
        const authCode = getAuthCodeFromUrl()

        // 백엔드로 인증 코드 전송하여 로그인 처리
        const response = await loginWithKakao(authCode)

        setStatus('success')

        // 회원가입 필요 여부에 따라 분기
        setTimeout(() => {
          clearUrlParams()
          if (response.requires_registration) {
            window.location.href = '/auth/complete-registration'
          } else {
            window.location.href = '/'
          }
        }, 2000)

      } catch (error) {
        console.error('카카오 로그인 콜백 처리 실패:', error)
        setError(error.message || '로그인 처리 중 오류가 발생했습니다.')
        setStatus('error')
      }
    }

    handleCallback()
  }, []) // 의존성 배열을 빈 배열로 변경!

  const handleRetry = () => {
    clearUrlParams()
    window.location.href = '/'
  }

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="bg-white rounded-2xl p-10 shadow-2xl text-center min-w-80 max-w-lg w-full">
            <div className="flex flex-col items-center gap-5">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
              <h2 className="text-2xl font-semibold text-gray-800">로그인 처리 중...</h2>
              <p className="text-gray-600">카카오 로그인을 처리하고 있습니다.</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="bg-white rounded-2xl p-10 shadow-2xl text-center min-w-80 max-w-lg w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-18 h-18 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">✓</div>
              <h2 className="text-3xl font-semibold text-green-500">로그인 성공!</h2>
              <p className="text-gray-600">곧 메인 페이지로 이동합니다.</p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="bg-white rounded-2xl p-10 shadow-2xl text-center min-w-80 max-w-lg w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-18 h-18 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">✗</div>
              <h2 className="text-3xl font-semibold text-red-500">로그인 실패</h2>
              <p className="text-gray-600 max-w-md leading-relaxed">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-amber-900 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-500 flex justify-center items-center p-5">
      {renderContent()}
    </div>
  )
}

export default KakaoCallback