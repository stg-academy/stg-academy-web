import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs.jsx'
import { useToast } from '../components/ui/ToastProvider.jsx'
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/phoneUtils.js'

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginWithCredentials, loginWithPhone, isLoading, error, clearError, isAuthenticated, needsRegistration } = useAuth()
  const toast = useToast()
  const [loginMode, setLoginMode] = useState('password') // 'password' | 'phone'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone_number: ''
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

  const validateForm = (data = formData) => {
    const errors = {}

    if (!data.username.trim()) {
      errors.username = '이름을 입력해주세요.'
    }

    if (loginMode === 'password') {
      if (!data.password) {
        errors.password = '비밀번호를 입력해주세요.'
      }
    } else {
      if (!data.phone_number.trim()) {
        errors.phone_number = '전화번호를 입력해주세요.'
      } else if (!isValidPhoneNumber(data.phone_number)) {
        errors.phone_number = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePhoneBlur = () => {
    if (!formData.phone_number.trim()) return

    const formatted = formatPhoneNumber(formData.phone_number)
    setFormData(prev => ({ ...prev, phone_number: formatted }))

    setFormErrors(prev => {
      const next = { ...prev }
      if (!isValidPhoneNumber(formatted)) {
        next.phone_number = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
      } else {
        delete next.phone_number
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 전화번호 탭에서는 blur 없이 바로 Enter를 누를 수 있으므로,
    // 검증 전에 먼저 하이픈 형식으로 정규화한다.
    let submitData = formData
    if (loginMode === 'phone' && formData.phone_number.trim()) {
      const formatted = formatPhoneNumber(formData.phone_number)
      if (formatted !== formData.phone_number) {
        submitData = { ...formData, phone_number: formatted }
        setFormData(submitData)
      }
    }

    if (!validateForm(submitData)) return

    try {
      if (loginMode === 'password') {
        await loginWithCredentials(submitData.username, submitData.password)
      } else {
        await loginWithPhone(submitData.username, submitData.phone_number)
      }
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
      toast.error(error.message || '로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <AuthLayout
      title="STG Academy"
      subtitle="계정에 로그인하세요"
      error={error}
    >
      {/* 로그인 방식 전환 */}
      <Tabs
        value={loginMode}
        onValueChange={(mode) => {
          setLoginMode(mode)
          setFormErrors({})
          if (error) clearError()
        }}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="password">비밀번호로 로그인</TabsTrigger>
          <TabsTrigger value="phone">전화번호로 로그인</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 일반 로그인 폼 */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
            이름
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
              formErrors.username ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="이름을 입력하세요"
            disabled={isLoading}
          />
          {formErrors.username && (
            <p className="mt-2 text-sm text-error-text">{formErrors.username}</p>
          )}
        </div>

        {loginMode === 'password' ? (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                formErrors.password ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
            {formErrors.password && (
              <p className="mt-2 text-sm text-error-text">{formErrors.password}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-700 mb-2">
              전화번호
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              onBlur={handlePhoneBlur}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                formErrors.phone_number ? 'border-error' : 'border-neutral-300'
              }`}
              placeholder="010-1234-5678"
              disabled={isLoading}
            />
            {formErrors.phone_number && (
              <p className="mt-2 text-sm text-error-text">{formErrors.phone_number}</p>
            )}
          </div>
        )}

        <div>
          <Button
            type="submit"
            disabled={isLoading || (loginMode === 'phone' && !!formErrors.phone_number)}
            className="w-full"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </div>
      </form>

      {/* 구분선 */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">또는</span>
          </div>
        </div>
      </div>

      {/* 카카오 로그인 — 카카오 공식 브랜드 컬러(#FEE500)는 v2 토큰 체계 밖의
          서드파티 브랜드 색상이라 그대로 유지. 중복된 style prop만 제거하고
          포커스 링을 노란색 대비 대신 어두운 색으로 바꿔 시인성 개선. */}
      <div className="mt-6">
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 bg-[#FEE500] text-black rounded-md hover:bg-[#F5DC00] focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-black/85"
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
          <span className="text-neutral-600">계정이 없으신가요? </span>
          <Link
            to="/register"
            className="font-medium text-accent hover:text-accent-hover transition-colors"
          >
            회원가입
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage