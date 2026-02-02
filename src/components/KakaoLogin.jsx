import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'

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
      <div className="flex justify-center my-5">
        <div className="flex items-center justify-center p-5 text-gray-600">로그인 상태 확인 중...</div>
      </div>
    )
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex justify-center my-5">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="mb-3 text-red-600 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="bg-red-600 text-white px-4 py-2 rounded text-xs hover:bg-red-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  // 로그인된 상태 - 사용자 정보 표시
  if (isAuthenticated && user) {
    return (
      <div className="bg-gray-50 rounded-xl p-5 my-5 text-center shadow-md">
        <div className="flex items-center justify-center gap-4 mb-5">
          {user.profile_image && (
            <img
              src={user.profile_image}
              alt="프로필"
              className="w-15 h-15 rounded-full object-cover border-2 border-yellow-400"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">안녕하세요!</h3>
            {user.nickname && (
              <p className="text-base font-semibold text-gray-600 mb-1">{user.nickname}님</p>
            )}
            {user.email && (
              <p className="text-sm text-gray-500">{user.email}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="bg-gray-600 text-white px-5 py-2.5 rounded-md text-sm hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>
    )
  }

  // 로그인하지 않은 상태 - 로그인 버튼 표시
  return (
    <div className="flex justify-center my-5">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-yellow-400 text-amber-900 px-6 py-3 rounded-lg text-base font-semibold hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
      >
        {isLoading ? '로그인 중...' : '카카오로 로그인'}
      </button>
    </div>
  )
}

export default KakaoLogin