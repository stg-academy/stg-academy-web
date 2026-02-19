import { useState, useEffect } from 'react'

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

    // 기존 사용자 선택 시 자동 채우기
    useEffect(() => {
        if (selectedUser) {
            setFormData(prev => ({
                ...prev,
                username: selectedUser.username || username || '',
                information: selectedUser.information || '',
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                username: username || '',
            }))
        }
    }, [selectedUser, username])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // 필드 변경 시 해당 오류 제거
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // 비밀번호 확인 필드 오류 제거
        if (field === 'password' && errors.confirmPassword) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors.confirmPassword
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // 비밀번호 검증 (비밀번호 입력이 필요한 경우)
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
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const submitData = {
            username,
            information: formData.information.trim(),
        }

        // 비밀번호가 필요한 경우 추가
        if (showPassword) {
            submitData.password = formData.password
        }

        // 기존 사용자 선택한 경우 ID 추가
        if (selectedUser) {
            submitData.existing_user_id = selectedUser.id
        }

        onSubmit(submitData)
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={isLoading}
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    이전 단계
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">사용자 정보 입력</h2>
                <p className="text-gray-600 mt-2">사용자명: <strong>{username}</strong></p>
                {selectedUser && (
                    <p className="text-sm text-green-600 mt-1">
                        기존 사용자 정보를 업데이트합니다. (수강 이력: {selectedUser.enrolled_session_count || 0}개)
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 표시명 */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        표시명
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        className={`w-full border bg-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
                            errors.username
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="표시될 이름을 입력하세요"
                        disabled
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>

                {/* 추가 정보 */}
                <div>
                    <label htmlFor="information" className="block text-sm font-medium text-gray-700 mb-1">
                        추가 정보
                    </label>
                    <textarea
                        id="information"
                        value={formData.information}
                        onChange={(e) => handleInputChange('information', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="소속, 직급 등 추가 정보를 입력하세요"
                        rows="3"
                        disabled={isLoading}
                    />
                </div>

                {/* 비밀번호 입력 (필요한 경우에만) */}
                {showPassword && (
                    <>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
                                    errors.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="6자 이상의 비밀번호를 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                비밀번호 확인 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
                                    errors.confirmPassword
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="비밀번호를 다시 입력하세요"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </>
                )}

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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