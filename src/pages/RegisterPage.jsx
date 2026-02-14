import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { registerUser, checkUsernameAvailable, isLoading, error, clearError, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    information: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [usernameCheck, setUsernameCheck] = useState({
    checking: false,
    message: '',
    isAvailable: false
  })

  // 회원가입 성공 시 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

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

    // 아이디 중복 확인 초기화
    if (name === 'username') {
      setUsernameCheck({
        checking: false,
        message: '',
        isAvailable: false
      })
    }
  }

  // 아이디 중복 확인 (디바운싱)
  useEffect(() => {
    if (formData.username.trim().length >= 3) {
      const timeoutId = setTimeout(async () => {
        setUsernameCheck(prev => ({ ...prev, checking: true }))
        try {
          const result = await checkUsernameAvailable(formData.username)
          setUsernameCheck({
            checking: false,
            message: result.message,
            isAvailable: result.available
          })
        } catch (err) {
          setUsernameCheck({
            checking: false,
            message: '중복 확인 중 오류가 발생했습니다.',
            isAvailable: false
          })
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setUsernameCheck({
        checking: false,
        message: '',
        isAvailable: false
      })
    }
  }, [formData.username, checkUsernameAvailable])

  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = '아이디를 입력해주세요.'
    } else if (formData.username.length < 3) {
      errors.username = '아이디는 3자 이상이어야 합니다.'
    } else if (!usernameCheck.isAvailable && formData.username.trim().length >= 3) {
      errors.username = '사용할 수 없는 아이디입니다.'
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다.'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (!formData.information.trim()) {
      errors.information = '소속정보를 입력해주세요.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await registerUser({
        username: formData.username,
        password: formData.password,
        information: formData.information
      })
      // AuthContext에서 성공 시 자동으로 로그인 처리됨
    } catch (err) {
      // 에러는 AuthContext에서 처리됨
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            STG Academy
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            새 계정을 만드세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          {/* 전역 에러 메시지 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 회원가입 폼 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                아이디 *
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formErrors.username ? 'border-red-300' :
                    usernameCheck.isAvailable ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="로그인에 사용할 아이디"
                />
                {usernameCheck.checking && (
                  <p className="mt-2 text-sm text-gray-500">중복 확인 중...</p>
                )}
                {usernameCheck.message && !usernameCheck.checking && (
                  <p className={`mt-2 text-sm ${usernameCheck.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {usernameCheck.message}
                  </p>
                )}
                {formErrors.username && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="6자 이상의 비밀번호"
                />
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="information" className="block text-sm font-medium text-gray-700">
                소속정보 *
              </label>
              <div className="mt-1">
                <input
                  id="information"
                  name="information"
                  type="text"
                  value={formData.information}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    formErrors.information ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="예: 신촌 청년1부, 문래 장년부"
                />
                {formErrors.information && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.information}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || usernameCheck.checking || !usernameCheck.isAvailable}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '회원가입 중...' : '회원가입'}
              </button>
            </div>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <div className="text-sm">
              <span className="text-gray-600">이미 계정이 있으신가요? </span>
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage