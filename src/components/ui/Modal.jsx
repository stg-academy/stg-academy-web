import {useState, useEffect} from 'react'

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = 'md:w-[500px]',
    disabled = false,
    onSubmit,
    submitText = '저장하기',
    loadingText = '저장 중...'
}) => {
    const [isAnimating, setIsAnimating] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 애니메이션 상태 관리 - 열기만 처리
    useEffect(() => {
        if (isOpen) {
            // DOM 업데이트 후 애니메이션 상태 변경
            const timer = setTimeout(() => {
                setIsAnimating(true)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // isOpen이 false로 변경될 때 닫기 애니메이션 처리
    useEffect(() => {
        if (!isOpen && isAnimating) {
            setIsAnimating(false)
        }
    }, [isOpen, isAnimating])

    // 폼 제출
    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        if (!onSubmit || isSubmitting || disabled) return

        setIsSubmitting(true)
        try {
            await onSubmit()
            // 성공 시 애니메이션과 함께 모달 닫기
            setTimeout(() => {
                handleClose()
            }, 100)
        } catch (error) {
            console.error('제출 실패:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 모달 닫기
    const handleClose = () => {
        if (disabled || isSubmitting) return
        // 애니메이션 시작
        setIsAnimating(false)
        // 애니메이션이 끝난 후 모달 완전히 닫기
        setTimeout(() => {
            onClose()
        }, 300) // transition duration과 동일
    }

    if (!isOpen && !isAnimating) return null

    return (
        <>
            {/* 오버레이 */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleClose}
            />

            {/* 모달 */}
            <div
                className={`fixed right-0 top-0 h-full w-full ${width} bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out ${
                    isAnimating ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* 헤더 */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {title}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={disabled || isSubmitting}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 바디 */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {children}
                    </div>

                    {/* 푸터 */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        {footer ? footer : (
                            onSubmit && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || disabled}
                                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                                        isSubmitting || disabled
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gray-900 hover:bg-gray-800'
                                    }`}
                                >
                                    {isSubmitting ? loadingText : submitText}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal