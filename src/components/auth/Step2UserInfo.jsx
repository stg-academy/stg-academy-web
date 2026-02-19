import { useState, useEffect, useCallback, useMemo } from 'react'

const Step2UserInfo = ({
    username,
    selectedUser = null,
    initialData = {},
    onSubmit,
    onBack,
    isLoading = false,
    showPassword = true,
    submitButtonText = '회원가입 완료'
}) => {
    const [formData, setFormData] = useState({
        information: '',
        password: '',
        confirmPassword: '',
        ...initialData
    })
    const [errors, setErrors] = useState({})

    // 디스플레이용 사용자명 (formData에서 제거)
    const displayUsername = useMemo(() => {
        return selectedUser?.username || username || ''
    }, [selectedUser, username])

    // 기존 사용자 선택 시 자동 채우기
    useEffect(() => {
        if (selectedUser?.information) {
            setFormData(prev => ({
                ...prev,
                information: selectedUser.information
            }))
        }
    }, [selectedUser])

    // 오류 제거 헬퍼 함수
    const clearFieldErrors = useCallback((fieldsToClear) => {
        setErrors(prev => {
            const newErrors = { ...prev }
            fieldsToClear.forEach(field => delete newErrors[field])
            return newErrors
        })
    }, [])

    // 입력 변경 핸들러
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // 관련 필드 오류 제거
        const fieldsToRemove = [field]
        if (field === 'password') fieldsToRemove.push('confirmPassword')

        clearFieldErrors(fieldsToRemove)
    }, [clearFieldErrors])

    // 폼 검증
    const validateForm = useCallback(() => {
        const newErrors = {}

        if (showPassword) {
            if (!formData.password) {
                newErrors.password = '비밀번호를 입력해주세요.'
            } else if (formData.password.length < 6) {
                newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData.password, formData.confirmPassword, showPassword])

    // 제출 핸들러
    const handleSubmit = useCallback((e) => {
        e.preventDefault()

        if (!validateForm()) return

        const submitData = {
            username,
            information: formData.information.trim(),
        }

        if (showPassword) {
            submitData.password = formData.password
        }

        if (selectedUser) {
            submitData.existing_user_id = selectedUser.id
        }

        onSubmit(submitData)
    }, [username, formData.information, formData.password, showPassword, selectedUser, onSubmit, validateForm])

    // 공통 입력 필드 스타일
    const getInputClassName = useCallback((fieldName) => {
        const baseClasses = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
        const errorClasses = "border-red-500 focus:ring-red-500"
        const normalClasses = "border-gray-300 focus:ring-blue-500"

        return `${baseClasses} ${errors[fieldName] ? errorClasses : normalClasses}`
    }, [errors])

    // 입력 필드 컴포넌트
    const InputField = ({ id, label, type = "text", required = false, placeholder, disabled = false, rows }) => {
        const Component = type === 'textarea' ? 'textarea' : 'input'
        const inputClassName = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors[id] ? 'border-red-500' : 'border-gray-300'
        }`

        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <Component
                    type={type !== 'textarea' ? type : undefined}
                    id={id}
                    value={formData[id] || ''}
                    onChange={(e) => handleInputChange(id, e.target.value)}
                    className={inputClassName}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    rows={rows}
                />
                {errors[id] && (
                    <p className="mt-2 text-sm text-red-500">{errors[id]}</p>
                )}
            </div>
        )
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    disabled={isLoading}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    이전 단계
                </button>
                <h2 className="text-xl font-semibold text-gray-900">사용자 정보 입력</h2>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        사용자명: <span className="font-semibold">{displayUsername}</span>
                    </p>
                    {selectedUser && (
                        <p className="text-sm text-green-700 mt-1">
                            기존 사용자 정보를 업데이트합니다. (수강 이력: {selectedUser.enrolled_session_count || 0}개)
                        </p>
                    )}
                </div>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 표시명 (읽기 전용) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">표시명</label>
                    <input
                        type="text"
                        value={displayUsername}
                        className="w-full px-4 py-3 border bg-gray-100 rounded-lg focus:outline-none border-gray-300 transition-all"
                        disabled
                    />
                </div>

                {/* 추가 정보 */}
                <InputField
                    id="information"
                    label="추가 정보"
                    type="textarea"
                    placeholder="소속, 직급 등 추가 정보를 입력하세요"
                    rows={3}
                />

                {/* 비밀번호 필드들 */}
                {showPassword && (
                    <>
                        <InputField
                            id="password"
                            label="비밀번호"
                            type="password"
                            required
                            placeholder="6자 이상의 비밀번호를 입력하세요"
                        />
                        <InputField
                            id="confirmPassword"
                            label="비밀번호 확인"
                            type="password"
                            required
                            placeholder="비밀번호를 다시 입력하세요"
                        />
                    </>
                )}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                    {isLoading ? '처리 중...' : submitButtonText}
                </button>
            </form>

            {/* 안내 메시지 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">안내사항</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 표시명은 시스템에서 사용자를 식별하는 데 사용됩니다.</li>
                    {selectedUser ? (
                        <li>• 기존 수강 이력은 그대로 유지됩니다.</li>
                    ) : (
                        <li>• 새로운 계정이 생성됩니다.</li>
                    )}
                    {showPassword && (
                        <li>• 비밀번호는 안전하게 암호화되어 저장됩니다.</li>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default Step2UserInfo