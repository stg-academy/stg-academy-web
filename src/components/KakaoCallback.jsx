import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAuthCodeFromUrl, clearUrlParams } from '../config/kakao'
import AuthLayout from './auth/AuthLayout.jsx'

const KakaoCallback = () => {
  const { loginWithKakao } = useAuth()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [error, setError] = useState(null)
  const isProcessing = useRef(false) // 처리 중 여부 체크

  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리 중이거나 완료된 경우 중복 실행 방지
      if (isProcessing.current) {
        return
      }

      // URL에 code 파라미터가 없으면 처리하지 않음
      const urlParams = new URLSearchParams(window.location.search)
      if (!urlParams.get('code')) {
        setError('인증 코드가 없습니다.')
        setStatus('error')
        return
      }

      isProcessing.current = true

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
        isProcessing.current = false // 에러 시에만 재시도 가능하도록
      }
    }

    handleCallback()
  }, [])

  const handleRetry = () => {
    clearUrlParams()
    window.location.href = '/'
  }

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-900">로그인 처리 중</h2>
            <p className="text-sm text-gray-600 text-center">카카오 로그인을 처리하고 있습니다.</p>
          </div>
        )

      case 'error':
        return (
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
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
            >
              메인으로 돌아가기
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthLayout title="STG Academy">
      {renderContent()}
    </AuthLayout>
  )
}

export default KakaoCallback