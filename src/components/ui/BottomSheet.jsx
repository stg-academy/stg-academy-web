import {useEffect, useState} from 'react'
import Icon from './Icon.jsx'

// Modal.jsx의 우측 슬라이드 패턴과 동일한 생명주기를 하단 고정 시트로 앵커링한 버전.
// 모바일 편집 플로우 전용 — footer는 호출부가 직접 구성한다 (ConfirmModal이 Modal을 쓰는 방식과 동일).
const BottomSheet = ({
                         isOpen,
                         onClose,
                         title,
                         children,
                         footer,
                         disabled = false,
                     }) => {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setIsAnimating(true)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen && isAnimating) {
            setIsAnimating(false)
        }
    }, [isOpen, isAnimating])

    const handleClose = () => {
        if (disabled) return
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
        }, 300)
    }

    if (!isOpen && !isAnimating) return null

    return (
        <>
            <div
                className={`fixed inset-0 bg-neutral-900/40 z-40 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleClose}
            />

            <div
                className={`fixed left-0 right-0 bottom-0 max-h-[88%] bg-white rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ease-in-out flex flex-col ${
                    isAnimating ? 'translate-y-0' : 'translate-y-full'
                }`}>
                <div className="px-5 py-4 border-b border-neutral-200 flex-none">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900">
                            {title}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-neutral-400 hover:text-neutral-600 transition-colors"
                            disabled={disabled}
                        >
                            <Icon name="x" size={24}/>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="px-5 py-4 border-t border-neutral-200 bg-neutral-50 flex-none">
                        {footer}
                    </div>
                )}
            </div>
        </>
    )
}

export default BottomSheet
