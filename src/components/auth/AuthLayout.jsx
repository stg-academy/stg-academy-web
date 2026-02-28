import { Link } from 'react-router-dom'

const AuthLayout = ({
    title = "",
    subtitle,
    currentStep,
    totalSteps,
    stepNames = [], // 새로 추가된 stepNames prop
    error,
    children,
    showLoginLink = false,
    extraContent = null
}) => {
    // 단계 표시 컴포넌트
    const StepIndicator = () => {
        if (!totalSteps || totalSteps < 2) return null

        const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

        // stepNames가 제공되고 첫 번째 step이 완료된 것으로 표시해야 하는 경우 확인
        const hasCompletedFirstStep = stepNames.length > 0 && currentStep > 1

        return (
            <div className="mt-5 flex items-start px-4 sm:px-0 overflow-x-auto">
                {steps.map((step, index) => {
                    const stepName = stepNames[step - 1] || (step === 1 ? '사용자명 확인' : step === 2 ? '계정 설정' : `단계 ${step}`)
                    const isCompleted = hasCompletedFirstStep && step < currentStep
                    const isCurrent = currentStep === step

                    return (
                        <div key={step} className="flex items-center">
                            {index > 0 && (
                                <div className="h-[1px] bg-gray-400 w-6 sm:w-9 -mt-6 mx-1 sm:mx-2 flex-shrink-0"></div>
                            )}
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-xs font-mono font-medium ${
                                    isCompleted
                                        ? 'bg-gray-900 border-gray-900 text-white'
                                        : isCurrent
                                        ? 'bg-[#111111] border-[#111111] text-white'
                                        : 'bg-white border-[#e5e5e5] text-[#888888]'
                                }`}>
                                    {isCompleted ? (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className={`text-xs whitespace-nowrap ${
                                    isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-[#888888]'
                                }`}>
                                    {stepName}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 헤더 */}
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-8 sm:mb-6 text-left px-4 sm:px-0">
                        {subtitle && (
                            <p className="text-gray-400 text-sm sm:text-base">{subtitle}</p>
                        )}
                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{title}</h1>

                        {/*todo: extraContent 삭제(카카오회원가입시 발생*/}
                        {extraContent}

                        {/* todo: 카카오회원가입 시 StepIndicator 이상함*/}
                        <StepIndicator />
                    </div>

                    {/* 메인 콘텐츠 카드 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mx-4 sm:mx-0">
                        <div className="p-6 sm:p-8">
                            {/* 전역 에러 메시지 */}
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {children}
                        </div>

                        {/* 로그인 링크 */}
                        {showLoginLink && (
                            <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                <div className="text-center text-sm">
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
        </div>
    )
}

export default AuthLayout