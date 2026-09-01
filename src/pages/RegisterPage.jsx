import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Step1UsernameCheck from '../components/auth/Step1UsernameCheck.jsx'
import Step2UserInfo from '../components/auth/Step2UserInfo.jsx'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { registerUser, isLoading, error, clearError, isAuthenticated } = useAuth()

  // 2단계 상태 관리
  const [currentStep, setCurrentStep] = useState(1)
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
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

  // 이벤트 핸들러들
  const handleUsernameConfirm = useCallback((confirmedUsername, confirmedPhoneNumber, user) => {
    setUsername(confirmedUsername)
    setPhoneNumber(confirmedPhoneNumber)
    setSelectedUser(user)
    setCurrentStep(2)
  }, [])

  const handleBack = useCallback(() => {
    setCurrentStep(1)
    setSelectedUser(null)
  }, [])

  const handleRegisterSubmit = useCallback(async (userData) => {
    try {
      await registerUser(userData)
    } catch {
      // 에러는 AuthContext에서 처리됨
    }
  }, [registerUser])

  return (
    <AuthLayout
      title="새 계정을 만드세요"
      subtitle="회원가입"
      currentStep={currentStep}
      stepNames={['본인 확인', '계정 설정']}
      totalSteps={2}
      error={error}
      showLoginLink={true}
    >
      {currentStep === 1 && (
        <Step1UsernameCheck
          initialUsername={username}
          initialPhoneNumber={phoneNumber}
          onUsernameConfirm={handleUsernameConfirm}
          isLoading={isLoading}
        />
      )}

      {currentStep === 2 && (
        <Step2UserInfo
          username={username}
          phoneNumber={phoneNumber}
          selectedUser={selectedUser}
          onSubmit={handleRegisterSubmit}
          onBack={handleBack}
          isLoading={isLoading}
          showPassword={true}
          submitButtonText="회원가입 완료"
        />
      )}
    </AuthLayout>
  )
}

export default RegisterPage