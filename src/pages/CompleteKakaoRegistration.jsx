import {useState, useEffect, useCallback, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Step1UsernameCheck from '../components/auth/Step1UsernameCheck.jsx'
import Step2UserInfo from '../components/auth/Step2UserInfo.jsx'

const CompleteKakaoRegistration = () => {
    const navigate = useNavigate()
    const {user, isAuthenticated, needsRegistration, completeKakaoRegistration, logout, isLoading, error, clearError} = useAuth()

    // 2단계 상태 관리
    const [currentStep, setCurrentStep] = useState(2)
    const [username, setUsername] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)

    // user 정보가 로드되면 초기 username 설정
    useEffect(() => {
        if (user?.username && !username) {
            setUsername(user.username)
        }
    }, [user, username])

    // 정식 로그인 완료 시 홈으로 리다이렉트
    useEffect(() => {
        if (isAuthenticated && !needsRegistration) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, needsRegistration, navigate])

    // 에러 초기화
    useEffect(() => {
        if (error) {
            clearError()
        }
    }, [currentStep, error, clearError])

    // 이벤트 핸들러들
    const handleUsernameConfirm = useCallback((confirmedUsername, user) => {
        setUsername(confirmedUsername)
        setSelectedUser(user)
        setCurrentStep(3)
    }, [])

    const handleExistingUserSelect = useCallback((user, inputUsername) => {
        setUsername(user.username)
        setSelectedUser(user)
        setCurrentStep(3)
    }, [])

    const handleBack = useCallback(() => {
        setCurrentStep(2)
        setSelectedUser(null)
    }, [])

    const handleKakaoRegisterSubmit = useCallback(async (userData) => {
        try {
            await completeKakaoRegistration(userData)
        } catch (err) {
            // 에러는 AuthContext에서 처리됨
        }
    }, [completeKakaoRegistration])

    // 카카오 사용자 정보 표시 컴포넌트
    const KakaoUserInfo = useMemo(() => (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
                카카오 로그인이 완료되었습니다!
            </p>
            {user && (
                <div className="mt-2 text-xs text-blue-600">
                    환영합니다, {user.username}님!
                </div>
            )}
        </div>
    ), [user])

    const handleCancel = useCallback(async () => {
        if (confirm('회원가입을 취소하시겠습니까? 로그아웃됩니다.')) {
            try {
                await logout()
                window.location.href = '/login'
            } catch (error) {
                console.error('로그아웃 실패:', error)
                localStorage.removeItem('auth_token')
                window.location.href = '/login'
            }
        }
    }, [logout])

    return (
        <AuthLayout
            title="STG Academy"
            subtitle="카카오 회원가입을 완료해주세요"
            currentStep={currentStep}
            stepNames={['카카오 로그인', '이름 확인', '계정 설정']}
            totalSteps={3}
            error={error}
            extraContent={KakaoUserInfo}
        >
            {currentStep === 2 && (
                <Step1UsernameCheck
                    initialUsername={username || user?.username || ''}
                    onUsernameConfirm={handleUsernameConfirm}
                    onExistingUserSelect={handleExistingUserSelect}
                    isLoading={isLoading}
                />
            )}

            {currentStep === 3 && (
                <Step2UserInfo
                    username={username}
                    selectedUser={selectedUser}
                    onSubmit={handleKakaoRegisterSubmit}
                    onBack={handleBack}
                    isLoading={isLoading}
                    showPassword={false}
                    submitButtonText="카카오 회원가입 완료"
                />
            )}

            {/* 취소 버튼 */}
            <div className="mt-6">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                    취소 (로그아웃)
                </button>
            </div>
        </AuthLayout>
    )
}

export default CompleteKakaoRegistration