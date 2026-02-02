import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAuthCodeFromUrl, clearUrlParams } from '../config/kakao'
import './KakaoCallback.css'

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
        await loginWithKakao(authCode)

        setStatus('success')

        // 성공 후 홈으로 이동
        setTimeout(() => {
          clearUrlParams()
          window.location.href = '/'
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
          <div className="callback-content">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h2>로그인 처리 중...</h2>
              <p>카카오 로그인을 처리하고 있습니다.</p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="callback-content">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>로그인 성공!</h2>
              <p>곧 메인 페이지로 이동합니다.</p>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="callback-content">
            <div className="error-message">
              <div className="error-icon">✗</div>
              <h2>로그인 실패</h2>
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-button">
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
    <div className="kakao-callback-container">
      {renderContent()}
    </div>
  )
}

export default KakaoCallback