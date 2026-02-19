import { useState, useEffect } from 'react'
import { authAPI } from '../../services/authService.js'
import { getUsersByUsername } from '../../services/userService.js'

const Step1UsernameCheck = ({
    initialUsername = '',
    onUsernameConfirm,
    onExistingUserSelect,
    isLoading = false
}) => {
    const [username, setUsername] = useState(initialUsername)
    const [isChecking, setIsChecking] = useState(false)
    const [isDuplicate, setIsDuplicate] = useState(false)
    const [similarUsers, setSimilarUsers] = useState([])
    const [error, setError] = useState('')
    const [checkCompleted, setCheckCompleted] = useState(false)
    const [isAvailable, setIsAvailable] = useState(false)

    // 자동 중복 검사 (디바운싱)
    useEffect(() => {
        if (username.trim().length >= 3) {
            const timeoutId = setTimeout(async () => {
                setIsChecking(true)
                setError('')
                setIsDuplicate(false)
                setSimilarUsers([])
                setCheckCompleted(false)
                setIsAvailable(false)

                try {
                    // 1. 중복 검사
                    const duplicateCheck = await authAPI.checkUsernameAvailable(username.trim())

                    if (!duplicateCheck.available) {
                        setIsDuplicate(true)
                    } else {
                        setIsAvailable(true)
                    }

                    // 2. 유사한 수동 등록 사용자 검색 (중복 여부와 관계없이 항상 수행)
                    try {
                        const similarUsersData = await getUsersByUsername(username.trim())
                        setSimilarUsers(similarUsersData || [])
                    } catch (err) {
                        console.error('유사 사용자 검색 실패:', err)
                        // 유사 사용자 검색 실패해도 검사는 완료
                    }

                    setCheckCompleted(true)
                } catch (err) {
                    console.error('사용자명 검사 실패:', err)
                    setError('사용자명 검사 중 오류가 발생했습니다.')
                } finally {
                    setIsChecking(false)
                }
            }, 500)

            return () => clearTimeout(timeoutId)
        } else {
            setIsChecking(false)
            setIsDuplicate(false)
            setSimilarUsers([])
            setCheckCompleted(false)
            setIsAvailable(false)
            setError('')
        }
    }, [username])

    // 새 사용자로 진행
    const handleProceedAsNew = () => {
        if (onUsernameConfirm) {
            onUsernameConfirm(username.trim(), null)
        }
    }

    // 기존 사용자 선택
    const handleSelectExistingUser = (user) => {
        if (onExistingUserSelect) {
            onExistingUserSelect(user, username.trim())
        }
    }

    const handleUsernameChange = (e) => {
        setUsername(e.target.value)
    }

    function getRecentSessions(recent_sessions) {
        console.log(recent_sessions)

        return recent_sessions.map((session) => {
                return session.title + ' (' + session.date_info + ')'
            }
        ).join(', ')
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">사용자명 확인</h2>

            {/* 사용자명 입력 */}
            <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    사용자명
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent ${
                        error ? 'border-red-500 focus:ring-red-500' :
                        isAvailable ? 'border-green-500 focus:ring-green-500' :
                        'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="사용자명을 입력하세요"
                    disabled={isLoading}
                />
                {isChecking && (
                    <p className="mt-2 text-sm text-gray-500">중복 확인 중...</p>
                )}
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
                {isAvailable && checkCompleted && !isChecking && (
                    <p className="mt-2 text-sm text-green-600">사용 가능한 사용자명입니다</p>
                )}
                {isDuplicate && checkCompleted && !isChecking && (
                    <p className="mt-2 text-sm text-yellow-600">이미 사용 중인 사용자명입니다</p>
                )}
            </div>

            {/* 검사 결과 */}
            {checkCompleted && !isChecking && (
                <div className="space-y-4">
                    {isAvailable ? (
                        // 사용 가능한 경우
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-green-800 font-medium">사용 가능한 사용자명입니다</p>
                                </div>
                                <button
                                    onClick={handleProceedAsNew}
                                    disabled={isLoading}
                                    className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? '진행 중...' : '다음 단계로'}
                                </button>
                            </div>

                            {/* 유사한 사용자가 있는 경우 표시 */}
                            {similarUsers.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        유사한 기존 등록 사용자 ({similarUsers.length}명)
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        기존 수강 이력이 있는 사용자 중에서 선택하시면 이력이 유지됩니다.
                                    </p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {similarUsers.map((user, index) => (
                                            <div
                                                key={user.id || index}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleSelectExistingUser(user)}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{user.username}</p>
                                                    <div className="text-sm text-gray-600">
                                                        {user.information && <p>{user.information}</p>}
                                                        <p>수강 이력: {user.enrolled_session_count || 0}개</p>
                                                        {user.recent_sessions && user.recent_sessions.length > 0 && (
                                                            <p>최근 수강: {getRecentSessions(user.recent_sessions)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // 중복인 경우
                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-yellow-800 font-medium">이미 사용 중인 사용자명입니다</p>
                                </div>
                            </div>

                            {similarUsers.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        유사한 기존 등록 사용자 ({similarUsers.length}명)
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        기존 수강 이력이 있는 사용자 중에서 선택하시면 이력이 유지됩니다.
                                    </p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {similarUsers.map((user, index) => (
                                            <div
                                                key={user.id || index}
                                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleSelectExistingUser(user)}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{user.username}</p>
                                                    <div className="text-sm text-gray-600">
                                                        {user.information && <p>{user.information}</p>}
                                                        <p>수강 이력: {user.enrolled_session_count || 0}개</p>
                                                        {user.recent_sessions && user.recent_sessions.length > 0 && (
                                                            <p>최근 수강: {getRecentSessions(user.recent_sessions)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Step1UsernameCheck