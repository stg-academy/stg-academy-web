import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'
import './KakaoLogin.css'

const KakaoLogin = () => {
  const { user, isAuthenticated, isLoading, error, logout, clearError } = useAuth()

  const handleLogin = () => {
    try {
      clearError()
      startKakaoLogin()
    } catch (error) {
      console.error('카카오 로그인 시작 실패:', error)
      alert(error.message || '로그인을 시작할 수 없습니다. 설정을 확인해주세요.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      console.log('로그아웃 성공')
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃에 실패했습니다.')
    }
  }

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="kakao-login-container">
        <div className="loading-spinner">로그인 상태 확인 중...</div>
      </div>
    )
  }

  // 에러 표시
  if (error) {
    return (
      <div className="kakao-login-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearError} className="error-clear-btn">
            확인
          </button>
        </div>
      </div>
    )
  }

  // 로그인된 상태 - 사용자 정보 표시
  if (isAuthenticated && user) {
    return (
      <div className="kakao-user-info">
        <div className="user-profile">
          {user.profile_image && (
            <img
              src={user.profile_image}
              alt="프로필"
              className="profile-image"
            />
          )}
          <div className="user-details">
            <h3>안녕하세요!</h3>
            {user.nickname && (
              <p className="nickname">{user.nickname}님</p>
            )}
            {user.email && (
              <p className="email">{user.email}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="kakao-logout-btn"
        >
          {isLoading ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    )
  }

  // 로그인하지 않은 상태 - 로그인 버튼 표시
  return (
    <div className="kakao-login-container">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="kakao-login-btn"
      >
        {isLoading ? '로그인 중...' : '카카오로 로그인'}
      </button>
    </div>
  )
}

export default KakaoLogin