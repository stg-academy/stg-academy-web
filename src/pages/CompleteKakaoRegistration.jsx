import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'

const CompleteKakaoRegistration = () => {
    const navigate = useNavigate()
    const {user, isAuthenticated, needsRegistration, completeKakaoRegistration, logout, isLoading, error, clearError} = useAuth()
    const [formData, setFormData] = useState({
        username: '',
        information: ''
    })
    const [formErrors, setFormErrors] = useState({})

    // user 정보가 로드되면 formData 업데이트
    useEffect(() => {
        if (user?.username) {
            setFormData(prev => ({
                ...prev,
                username: user.username
            }))
        }
    }, [user])

    // 정식 로그인 완료 시 홈으로 리다이렉트
    useEffect(() => {
        if (isAuthenticated && !needsRegistration) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, needsRegistration, navigate])

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // 입력 시 에러 클리어
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = {...prev}
                delete newErrors[name]
                return newErrors
            })
        }

        // 전역 에러 클리어
        if (error) {
            clearError()
        }
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.username.trim()) {
            errors.username = '표시명을 입력해주세요.'
        }

        if (!formData.information.trim()) {
            errors.information = '소속정보를 입력해주세요.'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            await completeKakaoRegistration({
                username: formData.username,
                information: formData.information
            })
            // AuthContext에서 성공 시 자동으로 정식 로그인 처리됨
            // useEffect에서 인증 상태 변경을 감지하여 자동 리다이렉트됨
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
                        회원가입을 완료해주세요
                    </p>
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                            카카오 로그인이 완료되었습니다! <br/>
                            추가 정보를 입력하여 회원가입을 완료해주세요.
                        </p>
                        {user && (
                            <div className="mt-2 text-xs text-blue-600">
                                환영합니다, {user.username}님!
                            </div>
                        )}
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

                    {/* 회원가입 완료 폼 */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                표시명 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        formErrors.username ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="화면에 표시될 이름"
                                />
                                {formErrors.username && (
                                    <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                카카오에서 가져온 닉네임을 수정하거나 그대로 사용할 수 있습니다.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="information" className="block text-sm font-medium text-gray-700">
                                소속정보 *
                            </label>
                            <div className="mt-1">
                                <input
                                    id="information"
                                    name="information"
                                    type="text"
                                    value={formData.information}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        formErrors.information ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="예: 신촌 청년1부, 문래 장년부"
                                />
                                {formErrors.information && (
                                    <p className="mt-2 text-sm text-red-600">{formErrors.information}</p>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                소속된 부서나 그룹 정보를 입력해주세요.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">확인사항</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• 카카오 계정으로 로그인됩니다</li>
                                <li>• 입력한 정보는 서비스 이용을 위해 사용됩니다</li>
                                <li>• 나중에 개인정보 설정에서 수정할 수 있습니다</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? '회원가입 완료 중...' : '회원가입 완료'}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                취소 (로그아웃)
                            </button>
                        </div>
                    </form>

                    {/* 진행 상태 표시 */}
                    <div className="mt-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-gray-900">카카오 인증 완료</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-gray-900">추가 정보 입력 (현재 단계)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompleteKakaoRegistration