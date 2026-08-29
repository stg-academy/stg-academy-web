import { Link } from 'react-router-dom'
import ErrorBanner from '../ui/ErrorBanner.jsx'
import Icon from '../ui/Icon.jsx'

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
                                <div className="h-[1px] bg-neutral-300 w-6 sm:w-9 -mt-6 mx-1 sm:mx-2 flex-shrink-0"></div>
                            )}
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-xs font-mono font-medium ${
                                    isCompleted
                                        ? 'bg-neutral-900 border-neutral-900 text-white'
                                        : isCurrent
                                        ? 'bg-neutral-900 border-neutral-900 text-white'
                                        : 'bg-white border-neutral-200 text-neutral-400'
                                }`}>
                                    {isCompleted ? (
                                        <Icon name="check" size={16} className="text-white" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className={`text-xs whitespace-nowrap ${
                                    isCompleted || isCurrent ? 'text-neutral-900 font-medium' : 'text-neutral-400'
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
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* 헤더 */}
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-8 sm:mb-6 text-left px-4 sm:px-0">
                        {subtitle && (
                            <p className="text-neutral-400 text-sm sm:text-base">{subtitle}</p>
                        )}
                        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-neutral-900">{title}</h1>

                        {/*todo: extraContent 삭제(카카오회원가입시 발생*/}
                        {extraContent}

                        {/* todo: 카카오회원가입 시 StepIndicator 이상함*/}
                        <StepIndicator />
                    </div>

                    {/* 메인 콘텐츠 카드 */}
                    <div className="bg-white rounded-lg border border-neutral-200 mx-4 sm:mx-0">
                        <div className="p-6 sm:p-8">
                            {/* 전역 에러 메시지 */}
                            <ErrorBanner message={error} className="mb-6 text-sm" />

                            {children}
                        </div>

                        {/* 로그인 링크 */}
                        {showLoginLink && (
                            <div className="px-6 sm:px-8 py-4 bg-neutral-50 border-t border-neutral-200 rounded-b-lg">
                                <div className="text-center text-sm">
                                    <span className="text-neutral-600">이미 계정이 있으신가요? </span>
                                    <Link
                                        to="/login"
                                        className="font-medium text-accent hover:text-accent-hover transition-colors"
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