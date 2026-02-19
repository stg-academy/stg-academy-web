import { Link } from 'react-router-dom'

const AuthLayout = ({
    title = "STG Academy",
    subtitle,
    currentStep,
    totalSteps,
    error,
    children,
    showLoginLink = false,
    extraContent = null
}) => {
    // 단계 표시 컴포넌트
    const StepIndicator = () => {
        if (!totalSteps || totalSteps < 2) return null

        const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)
        const hasKakaoStep = totalSteps === 3 // 카카오 등록의 경우

        return (
            <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-2">
                    {hasKakaoStep && (
                        <>
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="w-12 h-1 bg-gray-300"></div>
                        </>
                    )}
                    {steps.slice(hasKakaoStep ? 1 : 0).map((step, index) => (
                        <div key={step} className="flex items-center">
                            {index > 0 && <div className="w-12 h-1 bg-gray-300 mr-2"></div>}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                currentStep === step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                                {step}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* 헤더 */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
                    {subtitle && (
                        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                    )}
                    {extraContent}
                    <StepIndicator />
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {/* 전역 에러 메시지 */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {children}

                    {/* 로그인 링크 */}
                    {showLoginLink && (
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default AuthLayout