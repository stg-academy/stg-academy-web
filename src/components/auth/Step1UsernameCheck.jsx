import {useCallback, useMemo, useState} from 'react'
import {authAPI} from '../../services/authService.js'
import {formatPhoneNumber, isValidPhoneNumber} from '../../utils/phoneUtils.js'

const Step1UsernameCheck = ({
                                initialUsername = '',
                                initialPhoneNumber = '',
                                onUsernameConfirm,
                                isLoading = false
                            }) => {

    const [username, setUsername] = useState(initialUsername)
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
    const [phoneError, setPhoneError] = useState('')

    // null | 'checking' | 'available' | 'unavailable' | 'error'
    const [checkResult, setCheckResult] = useState(null)
    const [existingUser, setExistingUser] = useState(null)
    const [error, setError] = useState('')

    // 입력값이 마지막으로 확인한 값과 달라지면 결과를 무효화
    const [checkedFor, setCheckedFor] = useState(null)
    const isStale = checkedFor && (checkedFor.username !== username.trim() || checkedFor.phoneNumber !== phoneNumber.trim())
    const effectiveResult = isStale ? null : checkResult

    const canCheck = useMemo(() => {
        return username.trim().length >= 2 && isValidPhoneNumber(phoneNumber) && checkResult !== 'checking'
    }, [username, phoneNumber, checkResult])

    const handleUsernameChange = useCallback((e) => {
        setUsername(e.target.value)
    }, [])

    const handlePhoneChange = useCallback((e) => {
        setPhoneNumber(e.target.value)
        if (phoneError) setPhoneError('')
    }, [phoneError])

    const handlePhoneBlur = useCallback(() => {
        if (!phoneNumber.trim()) return
        const formatted = formatPhoneNumber(phoneNumber)
        setPhoneNumber(formatted)
        setPhoneError(isValidPhoneNumber(formatted) ? '' : '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)')
    }, [phoneNumber])

    // 이름+전화번호 조합 가입 가능 여부 확인
    const handleCheck = useCallback(async () => {
        const trimmedUsername = username.trim()
        const trimmedPhone = phoneNumber.trim()

        if (!isValidPhoneNumber(trimmedPhone)) {
            setPhoneError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)')
            return
        }

        setCheckResult('checking')
        setError('')

        try {
            const result = await authAPI.checkRegistration(trimmedUsername, trimmedPhone)
            setCheckedFor({username: trimmedUsername, phoneNumber: trimmedPhone})
            setExistingUser(result.available && result.existing_user_id ? {
                id: result.existing_user_id,
                username: trimmedUsername,
                information: result.information || ''
            } : null)
            setCheckResult(result.available ? 'available' : 'unavailable')
        } catch (err) {
            console.error('가입 가능 여부 확인 실패:', err)
            setCheckedFor({username: trimmedUsername, phoneNumber: trimmedPhone})
            setError('확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
            setCheckResult('error')
        }
    }, [username, phoneNumber])

    const handleProceed = useCallback(() => {
        onUsernameConfirm?.(username.trim(), phoneNumber.trim(), existingUser)
    }, [onUsernameConfirm, username, phoneNumber, existingUser])

    const handlePrimaryAction = useCallback(() => {
        if (effectiveResult === 'available') {
            handleProceed()
        } else {
            handleCheck()
        }
    }, [effectiveResult, handleProceed, handleCheck])

    // 상태 메시지
    const statusMessage = useMemo(() => {
        if (effectiveResult === 'checking') return {text: '확인 중...', className: 'text-neutral-500'}
        if (effectiveResult === 'error') return {text: error, className: 'text-error-text'}
        if (effectiveResult === 'available') return {text: '회원가입 가능한 사용자입니다', className: 'text-success-text'}
        if (effectiveResult === 'unavailable') return {text: '이미 가입된 사용자입니다', className: 'text-error-text'}
        return null
    }, [effectiveResult, error])

    const primaryButtonDisabled = isLoading || effectiveResult === 'checking' || effectiveResult === 'unavailable' || (effectiveResult !== 'available' && !canCheck)
    const primaryButtonText = effectiveResult === 'checking'
        ? '확인 중...'
        : effectiveResult === 'available'
            ? '다음'
            : '확인'

    return (
        <div>
            {/* 이름 입력 */}
            <div className="mb-4">
                <label htmlFor="username" className="block text-xs font-medium text-neutral-700 mb-2">
                    이름
                    <span className="text-error ml-1">*</span>
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full h-10 px-3 border rounded-md text-sm bg-neutral-50 focus:bg-white focus:outline-none transition-all ${
                        effectiveResult === 'unavailable'
                            ? 'border-error'
                            : effectiveResult === 'available'
                                ? 'border-accent focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                                : 'border-neutral-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                    }`}
                    placeholder="이름을 입력하세요"
                    disabled={isLoading}
                />
            </div>

            {/* 전화번호 입력 */}
            <div className="mb-6">
                <label htmlFor="phone_number" className="block text-xs font-medium text-neutral-700 mb-2">
                    전화번호
                    <span className="text-error ml-1">*</span>
                </label>
                <input
                    type="tel"
                    id="phone_number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    className={`w-full h-10 px-3 border rounded-md text-sm bg-neutral-50 focus:bg-white focus:outline-none transition-all ${
                        phoneError || effectiveResult === 'unavailable'
                            ? 'border-error'
                            : effectiveResult === 'available'
                                ? 'border-accent focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                                : 'border-neutral-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                    }`}
                    placeholder="010-1234-5678"
                    disabled={isLoading}
                />
                {phoneError && (
                    <p className="mt-2 text-xs sm:text-sm text-error-text">{phoneError}</p>
                )}
            </div>

            {statusMessage && (
                <p className={`mb-4 text-xs sm:text-sm ${statusMessage.className}`}>
                    {statusMessage.text}
                </p>
            )}

            <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={primaryButtonDisabled}
                className="w-full px-4 py-2.5 sm:py-3 bg-accent text-white rounded-md sm:rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm sm:text-base"
            >
                {primaryButtonText}
            </button>

            {/* 안내 메시지 */}
            <div className="mt-6 p-3 sm:p-4 bg-neutral-50 rounded-md">
                <h4 className="text-xs sm:text-sm font-medium text-neutral-900 mb-2">안내사항</h4>
                <ul className="text-xs text-neutral-600 space-y-1">
                    <li>• 이름과 전화번호는 출석관리자가 사용자를 식별하는 데 사용됩니다.</li>
                    <li>• 교회 내 동명이인으로 인해 이름이 중복되는 경우 별명과 함께 등록해주세요</li>
                    <li className="px-3">예: 이정규(시광대담임목사) 서금옥(큐티) 등</li>
                    <li>• 그 외 사용문의는 시스템 담당자에게 문의해주세요 (문의하기)</li>
                </ul>
            </div>
        </div>
    )
}

export default Step1UsernameCheck
