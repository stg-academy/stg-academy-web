import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs.jsx'
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/phoneUtils.js'
import { getNormalUsersByUsername } from '../services/userService.js'

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginWithCredentials, loginWithPhone, isLoading, error, clearError, isAuthenticated } = useAuth()
  const [loginMode, setLoginMode] = useState('phone') // 'password' | 'phone'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone_number: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // 이름 검색 드롭다운 (동명이인 식별용)
  const [usernameSearchResults, setUsernameSearchResults] = useState([])
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false)
  const usernameSearchDebounceRef = useRef(null)
  // 검색 결과에서 선택한 사용자 — 로그인 시 id를 함께 보내 동명이인을 구분한다
  const [selectedUser, setSelectedUser] = useState(null)

  // 로그인 성공 시 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleUsernameSearch = useCallback((searchTerm) => {
    if (usernameSearchDebounceRef.current) clearTimeout(usernameSearchDebounceRef.current)

    if (!searchTerm || searchTerm.trim().length < 2) {
      setUsernameSearchResults([])
      setShowUsernameDropdown(false)
      return
    }

    usernameSearchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await getNormalUsersByUsername(searchTerm.trim())
        setUsernameSearchResults(results || [])
        setShowUsernameDropdown((results || []).length > 0)
      } catch (err) {
        console.error('이름 검색 실패:', err)
      }
    }, 400)
  }, [])

  const handleSelectUsername = useCallback((user) => {
    setSelectedUser(user)
    setFormData(prev => ({ ...prev, username: user.username }))
    setShowUsernameDropdown(false)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'username') {
      // 선택된 사용자와 이름이 달라지면(직접 수정) 선택 해제 — 더 이상 같은 사람이라고 보장할 수 없음
      if (selectedUser && value !== selectedUser.username) {
        setSelectedUser(null)
      }
      handleUsernameSearch(value)
    }

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

    // Enter로 바로 제출하면 이름 입력창의 blur가 안 일어날 수 있으므로,
    // 검색 결과가 1명뿐인데 아직 선택 안 한 경우 여기서도 자동 선택한다.
    let effectiveUser = selectedUser
    if (!effectiveUser && usernameSearchResults.length === 1) {
      effectiveUser = usernameSearchResults[0]
      setSelectedUser(effectiveUser)
    }

    try {
      if (loginMode === 'password') {
        await loginWithCredentials(submitData.username, submitData.password, effectiveUser?.id)
      } else {
        await loginWithPhone(submitData.username, submitData.phone_number, effectiveUser?.id)
      }
      // AuthContext에서 성공 시 자동으로 홈으로 리다이렉트됨
    } catch {
      // 에러는 AuthContext에서 처리됨
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
          <TabsTrigger value="phone">전화번호로 로그인</TabsTrigger>
          <TabsTrigger value="password">비밀번호로 로그인</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 일반 로그인 폼 */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="relative">
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
            이름
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            value={formData.username}
            onChange={handleInputChange}
            onFocus={() => usernameSearchResults.length > 0 && setShowUsernameDropdown(true)}
            onBlur={() => setTimeout(() => {
              setShowUsernameDropdown(false)
              // 검색 결과가 1명뿐인데 아직 클릭으로 선택하지 않고 포커스를 벗어난 경우 자동 선택
              if (!selectedUser && usernameSearchResults.length === 1) {
                handleSelectUsername(usernameSearchResults[0])
              }
            }, 150)}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
              formErrors.username ? 'border-error' : 'border-neutral-300'
            }`}
            placeholder="이름을 입력하세요 (2글자 이상 입력 시 검색)"
            disabled={isLoading}
          />
          {formErrors.username && (
            <p className="mt-2 text-sm text-error-text">{formErrors.username}</p>
          )}

          {selectedUser && (selectedUser.information || selectedUser.phone_number) && (
            <div className="mt-2 text-xs text-neutral-500 space-x-1">
              {selectedUser.information && <span>{selectedUser.information}</span>}
              {selectedUser.phone_number && <span>· {selectedUser.phone_number.slice(-4)}</span>}
            </div>
          )}

          {showUsernameDropdown && usernameSearchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {usernameSearchResults.map((user, index) => (
                <button
                  key={user.id || index}
                  type="button"
                  onMouseDown={() => handleSelectUsername(user)}
                  className="w-full px-4 py-2.5 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                >
                  <p className="font-medium text-neutral-900 text-sm">{user.username}</p>
                  <div className="mt-0.5 text-xs text-neutral-500 space-x-1">
                    {user.information && <span>{user.information}</span>}
                    {user.phone_number && (
                      <span>· {user.phone_number.slice(-4)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
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