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

        clearUrlParams()
        if (response.requires_registration) {
          window.location.href = '/auth/complete-registration'
        } else {
          window.location.href = '/'
        }

      } catch (error) {
        console.error('카카오 로그인 콜백 처리 실패:', error)
        setError(error.message || '로그인 처리 중 오류가 발생했습니다.')
        setStatus('error')

        setTimeout(console.log('카카오 로그인 콜백 처리 실패:', error), 50000) // 5초 후에 에러 로그 출력
      }
    }

    handleCallback()
  }, []) // 의존성 배열을 빈 배열로 변경

  const handleRetry = () => {
    clearUrlParams()
    window.location.href = '/'
  }

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <h2 className="text-xl font-semibold text-gray-900">로그인 처리 중</h2>
              <p className="text-sm text-gray-600 text-center">카카오 로그인을 처리하고 있습니다.</p>
            </div>
          </div>
        )

      case 'error':
        console.log(error)
        return (
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">로그인 실패</h2>
              <p className="text-sm text-gray-600 text-center">{error}</p>
              <button
                onClick={handleRetry}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">STG Academy</h2>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

export default KakaoCallback