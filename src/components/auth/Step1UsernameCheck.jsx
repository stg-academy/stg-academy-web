import {useCallback, useEffect, useMemo, useState} from 'react'
import {authAPI} from '../../services/authService.js'
import {getUsersByUsername} from '../../services/userService.js'

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
        setCheckState(prev => ({...prev, isChecking: true}))
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
            setCheckState(prev => ({...prev, isChecking: false}))
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
        if (checkState.isChecking) return {text: "중복 확인 중...", className: "text-gray-500"}
        if (error) return {text: error, className: "text-red-600"}
        if (checkState.checkCompleted && !checkState.isChecking) {
            if (checkState.isAvailable) return {text: "사용 가능한 사용자명입니다", className: "text-green-600"}
            if (checkState.isDuplicate) return {text: "이미 사용 중인 사용자명입니다", className: "text-red-600"}
        }
        return null
    }, [checkState, error])

    // 사용자 목록 렌더링 컴포넌트
    const UserList = ({users, onSelectUser}) => (
        <>

            <div className="h-px bg-gray-200 my-5"></div>

            <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-semibold text-gray-900">
                    기존 등록 사용자
                </h3>
                <span
                    className="px-3 py-1 rounded-full text-xs  border border-gray-400 bg-gray-200 text-gray-900">{users.length}명</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
                기존 수강 이력이 있는 사용자 중에서 선택하시면 이력이 유지됩니다.
            </p>
            <div className="border-t-gray-200 border-b-gray-200 space-y-3 max-h-60 overflow-y-auto">
                {users.map((user, index) => (
                    <div
                        key={user.id || index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all"
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            <div className="mt-1 text-sm text-gray-600 space-y-1">
                                {user.information &&
                                    <span
                                        className="inline-block  text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">{user.information}</span>}
                                <span
                                    className="inline-block  text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded mr-1">수강 {user.enrolled_session_count || 0}개</span>
                                {user.recent_sessions && user.recent_sessions.length > 0 && (
                                    <p>{formatRecentSessions(user.recent_sessions)}</p>
                                )}
                            </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                ))}
            </div>
        </>
    )

    return (
        <div>
            {/* 사용자명 입력 */}
            <div className="mb-6">
                <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2">
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
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
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

                    {/* 유사한 사용자 목록 */}
                    {similarUsers.length > 0 && (
                        <UserList
                            users={similarUsers}
                            onSelectUser={handleSelectExistingUser}
                        />
                    )}

                </div>
            )}
        </div>
    )
}

export default Step1UsernameCheck