import { useState, useEffect, useCallback, useMemo } from 'react'
import { authAPI } from '../../services/authService.js'
import { getUsersByUsername } from '../../services/userService.js'

const Step1UsernameCheck = ({
    initialUsername = '',
    onUsernameConfirm,
    onExistingUserSelect,
    isLoading = false
}) => {
    const [username, setUsername] = useState(initialUsername)
    const [checkState, setCheckState] = useState({
        isChecking: false,
        isDuplicate: false,
        isAvailable: false,
        checkCompleted: false
    })
    const [similarUsers, setSimilarUsers] = useState([])
    const [error, setError] = useState('')

    // 상태 초기화 함수
    const resetCheckState = useCallback(() => {
        setCheckState({
            isChecking: false,
            isDuplicate: false,
            isAvailable: false,
            checkCompleted: false
        })
        setSimilarUsers([])
        setError('')
    }, [])

    // 사용자명 검사 함수
    const checkUsername = useCallback(async (usernameToCheck) => {
        setCheckState(prev => ({ ...prev, isChecking: true }))
        setError('')
        setSimilarUsers([])

        try {
            // 1. 중복 검사
            const duplicateCheck = await authAPI.checkUsernameAvailable(usernameToCheck)

            // 2. 유사한 사용자 검색 (항상 수행)
            const similarUsersData = await getUsersByUsername(usernameToCheck).catch(err => {
                console.error('유사 사용자 검색 실패:', err)
                return []
            })

            setCheckState({
                isChecking: false,
                isDuplicate: !duplicateCheck.available,
                isAvailable: duplicateCheck.available,
                checkCompleted: true
            })
            setSimilarUsers(similarUsersData || [])
        } catch (err) {
            console.error('사용자명 검사 실패:', err)
            setError('사용자명 검사 중 오류가 발생했습니다.')
            setCheckState(prev => ({ ...prev, isChecking: false }))
        }
    }, [])

    // 자동 중복 검사 (디바운싱)
    useEffect(() => {
        const trimmedUsername = username.trim()

        if (trimmedUsername.length >= 3) {
            const timeoutId = setTimeout(() => {
                checkUsername(trimmedUsername)
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            resetCheckState()
        }
    }, [username, checkUsername, resetCheckState])

    // 이벤트 핸들러들
    const handleProceedAsNew = useCallback(() => {
        onUsernameConfirm?.(username.trim(), null)
    }, [onUsernameConfirm, username])

    const handleSelectExistingUser = useCallback((user) => {
        onExistingUserSelect?.(user, username.trim())
    }, [onExistingUserSelect, username])

    const handleUsernameChange = useCallback((e) => {
        setUsername(e.target.value)
    }, [])

    // 최근 세션 포맷팅
    const formatRecentSessions = useCallback((recent_sessions) => {
        return recent_sessions.map(session =>
            `${session.title} (${session.date_info})`
        ).join(', ')
    }, [])

    // 입력 필드 스타일
    const inputClassName = useMemo(() => {
        const baseClasses = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"

        if (error) return `${baseClasses} border-red-500 focus:ring-red-500`
        if (checkState.isAvailable) return `${baseClasses} border-green-500 focus:ring-green-500`
        return `${baseClasses} border-gray-300 focus:ring-blue-500`
    }, [error, checkState.isAvailable])

    // 상태 메시지
    const statusMessage = useMemo(() => {
        if (checkState.isChecking) return { text: "중복 확인 중...", className: "text-gray-500" }
        if (error) return { text: error, className: "text-red-600" }
        if (checkState.checkCompleted && !checkState.isChecking) {
            if (checkState.isAvailable) return { text: "사용 가능한 사용자명입니다", className: "text-green-600" }
            if (checkState.isDuplicate) return { text: "이미 사용 중인 사용자명입니다", className: "text-yellow-600" }
        }
        return null
    }, [checkState, error])

    // 사용자 목록 렌더링 컴포넌트
    const UserList = ({ users, onSelectUser }) => (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
                유사한 기존 등록 사용자 ({users.length}명)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                기존 수강 이력이 있는 사용자 중에서 선택하시면 이력이 유지됩니다.
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {users.map((user, index) => (
                    <div
                        key={user.id || index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all"
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            <div className="mt-1 text-sm text-gray-600 space-y-1">
                                {user.information && <p>{user.information}</p>}
                                <p>수강 이력: <span className="font-medium">{user.enrolled_session_count || 0}개</span></p>
                                {user.recent_sessions && user.recent_sessions.length > 0 && (
                                    <p>최근 수강: {formatRecentSessions(user.recent_sessions)}</p>
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
    )

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">사용자명 확인</h2>

            {/* 사용자명 입력 */}
            <div className="mb-6">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    사용자명
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        error ? 'border-red-500' :
                        checkState.isAvailable ? 'border-green-500' :
                        'border-gray-300'
                    }`}
                    placeholder="사용자명을 입력하세요"
                    disabled={isLoading}
                />
                {statusMessage && (
                    <p className={`mt-2 text-sm ${statusMessage.className}`}>
                        {statusMessage.text}
                    </p>
                )}
            </div>

            {/* 검사 결과 */}
            {checkState.checkCompleted && !checkState.isChecking && (
                <div className="space-y-4">
                    {checkState.isAvailable && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center mb-3">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-green-800 font-medium">사용 가능한 사용자명입니다</p>
                            </div>
                            <button
                                onClick={handleProceedAsNew}
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                {isLoading ? '진행 중...' : '다음 단계로'}
                            </button>
                        </div>
                    )}

                    {checkState.isDuplicate && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-yellow-800 font-medium">이미 사용 중인 사용자명입니다</p>
                            </div>
                        </div>
                    )}

                    {/* 유사한 사용자 목록 */}
                    {similarUsers.length > 0 && (
                        <UserList
                            users={similarUsers}
                            onSelectUser={handleSelectExistingUser}
                        />
                    )}

                    {/* 새 사용자명 입력 옵션 (중복인 경우에만) */}
                    {checkState.isDuplicate && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">새로운 사용자로 등록</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                다른 사용자명을 입력하여 새로운 계정을 생성하세요.
                            </p>
                            <button
                                onClick={() => {
                                    setUsername('')
                                    resetCheckState()
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
                            >
                                다른 사용자명 입력
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Step1UsernameCheck