import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Step1UsernameCheck from '../components/auth/Step1UsernameCheck.jsx'
import Step2UserInfo from '../components/auth/Step2UserInfo.jsx'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { registerUser, isLoading, error, clearError, isAuthenticated } = useAuth()

  // 2단계 상태 관리
  const [currentStep, setCurrentStep] = useState(1)
  const [username, setUsername] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  // 회원가입 성공 시 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // 에러 초기화
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [currentStep, error, clearError])

  // 1단계: 사용자명 확인 완료
  const handleUsernameConfirm = (confirmedUsername, user) => {
    setUsername(confirmedUsername)
    setSelectedUser(user)
    setCurrentStep(2)
  }

  // 1단계: 기존 사용자 선택
  const handleExistingUserSelect = (user, inputUsername) => {
    setUsername(user.username)
    setSelectedUser(user)
    setCurrentStep(2)
  }

  // 2단계: 이전 단계로 돌아가기
  const handleBack = () => {
    setCurrentStep(1)
    setSelectedUser(null)
  }

  // 2단계: 회원가입 완료
  const handleRegisterSubmit = async (userData) => {
    try {
      await registerUser(userData)
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
          {/* 단계 표시 */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className="w-12 h-1 bg-gray-300"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
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

          {/* 단계별 컴포넌트 렌더링 */}
          {currentStep === 1 && (
            <Step1UsernameCheck
              onUsernameConfirm={handleUsernameConfirm}
              onExistingUserSelect={handleExistingUserSelect}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && (
            <Step2UserInfo
              username={username}
              selectedUser={selectedUser}
              onSubmit={handleRegisterSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              showPassword={true}
              submitButtonText="회원가입 완료"
            />
          )}

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