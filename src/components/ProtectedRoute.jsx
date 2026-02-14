import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { hasRole, getRoleDisplayName } from '../utils/roleUtils'

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, needsRegistration, isLoading } = useAuth()

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // 회원가입이 필요한 경우
  if (needsRegistration) {
    return <Navigate to="/auth/complete-registration" replace />
  }

  // 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // 특정 역할이 필요한 페이지인데 권한이 없는 경우
  if (requiredRole && (!user || !hasRole(user, requiredRole))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">
            이 페이지에 접근하려면 {getRoleDisplayName(requiredRole)} 권한이 필요합니다.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute