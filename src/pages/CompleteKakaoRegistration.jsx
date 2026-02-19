import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import Step1UsernameCheck from '../components/auth/Step1UsernameCheck.jsx'
import Step2UserInfo from '../components/auth/Step2UserInfo.jsx'

const CompleteKakaoRegistration = () => {
    const navigate = useNavigate()
    const {user, isAuthenticated, needsRegistration, completeKakaoRegistration, logout, isLoading, error, clearError} = useAuth()

    // 2단계 상태 관리
    const [currentStep, setCurrentStep] = useState(1)
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
    const handleKakaoRegisterSubmit = async (userData) => {
        try {
            await completeKakaoRegistration(userData)
            // AuthContext에서 성공 시 자동으로 정식 로그인 처리됨
        } catch (err) {
            // 에러는 AuthContext에서 처리됨
        }
    }

    const handleCancel = async () => {
        if (confirm('회원가입을 취소하시겠습니까? 로그아웃됩니다.')) {
            try {
                await logout()
                window.location.href = '/login'
            } catch (error) {
                console.error('로그아웃 실패:', error)
                // 에러가 발생해도 강제로 로그아웃 처리
                localStorage.removeItem('auth_token')
                window.location.href = '/login'
            }
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
                        카카오 회원가입을 완료해주세요
                    </p>
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
                    {/* 단계 표시 */}
                    <div className="mt-4 flex justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="w-12 h-1 bg-gray-300"></div>
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
                            initialUsername={username || user?.username || ''}
                            onUsernameConfirm={handleUsernameConfirm}
                            onExistingUserSelect={handleExistingUserSelect}
                            isLoading={isLoading}
                        />
                    )}

                    {currentStep === 2 && (
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
                </div>
            </div>
        </div>
    )
}

export default CompleteKakaoRegistration