import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'
import AuthLayout from '../components/auth/AuthLayout.jsx'

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginWithCredentials, isLoading, error, clearError, isAuthenticated, needsRegistration } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // 로그인 성공 시 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !needsRegistration) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, needsRegistration, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 입력 시 에러 클리어
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // 전역 에러 클리어
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = '아이디를 입력해주세요.'
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await loginWithCredentials(formData.username, formData.password)
      // AuthContext에서 성공 시 자동으로 홈으로 리다이렉트됨
    } catch (err) {
      // 에러는 AuthContext에서 처리됨
    }
  }

  const handleKakaoLogin = () => {
    try {
      startKakaoLogin()
    } catch (error) {
      console.error('카카오 로그인 시작 실패:', error)
      alert(error.message || '로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <AuthLayout
      title="STG Academy"
      subtitle="계정에 로그인하세요"
      error={error}
    >
      {/* 일반 로그인 폼 */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            아이디
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              formErrors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="아이디를 입력하세요"
            disabled={isLoading}
          />
          {formErrors.username && (
            <p className="mt-2 text-sm text-red-500">{formErrors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              formErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
          />
          {formErrors.password && (
            <p className="mt-2 text-sm text-red-500">{formErrors.password}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </div>
      </form>

      {/* 구분선 */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>
      </div>

      {/* 카카오 로그인 */}
      <div className="mt-6">
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 bg-[#FEE500] text-black rounded-xl hover:bg-[#F5DC00] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-black/85"
          style={{ backgroundColor: '#FEE500' }}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 18 17"
            fill="none"
          >
            <path
              d="M9 1.5c4.687 0 8.5 3.077 8.5 6.875S13.687 15.25 9 15.25c-.875 0-1.719-.125-2.531-.344L3.5 16.75v-3.531c-1.344-1.031-2.25-2.594-2.25-4.344C1.25 4.577 5.063 1.5 9 1.5z"
              fill="#000000"
            />
          </svg>
          카카오 로그인
        </button>
      </div>

      {/* 회원가입 링크 */}
      <div className="mt-6 text-center">
        <div className="text-sm">
          <span className="text-gray-600">계정이 없으신가요? </span>
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage