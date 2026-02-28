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

    useEffect(() => {
        if (initialUsername && initialUsername !== username) {
            setUsername(initialUsername)
        }
    }, [initialUsername])

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

    // 이름 검사 함수
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
            console.error('이름 검사 실패:', err)
            setError('이름 검사 중 오류가 발생했습니다.')
            setCheckState(prev => ({...prev, isChecking: false}))
        }
    }, [])

    // 자동 중복 검사 (디바운싱)
    useEffect(() => {
        const trimmedUsername = username.trim()

        if (trimmedUsername.length >= 2) {
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
            if (checkState.isAvailable) return {text: "사용 가능한 이름입니다", className: "text-green-600"}
            if (checkState.isDuplicate) return {text: "이미 사용 중인 이름입니다", className: "text-red-600"}
        }
        return null
    }, [checkState, error])

    // 사용자 목록 렌더링 컴포넌트
    const UserList = ({users, onSelectUser}) => (
        <>

            <div className="h-px bg-gray-200 my-5"></div>

            <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    기존 등록 사용자
                </h3>
                <span
                    className="px-2 sm:px-3 py-1 rounded-full text-xs border border-gray-400 bg-gray-200 text-gray-900">{users.length}명</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-3">
                기존 수강 이력을 유지하시려면 아래 사용자를 선택하세요<br/>
                새로운 계정으로 시작하시려면 "신규 사용자로 등록하기"를 선택하세요
            </p>
            <div className="border-t-gray-200 border-b-gray-200 space-y-3 max-h-60 overflow-y-auto">
                {users.map((user, index) => (
                    <div
                        key={user.id || index}
                        className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all"
                        onClick={() => onSelectUser(user)}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.username}</p>
                            <div className="mt-1 text-xs sm:text-sm text-gray-600 space-y-1">
                                {user.information &&
                                    <span
                                        className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1">{user.information}</span>}
                                <span
                                    className="inline-block text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded mr-1">수강 {user.enrolled_session_count || 0}개</span>
                                {user.recent_sessions && user.recent_sessions.length > 0 && (
                                    <p className="text-xs break-words">{formatRecentSessions(user.recent_sessions)}</p>
                                )}
                            </div>
                        </div>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" fill="none"
                             stroke="currentColor"
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
            {/* 이름 입력 */}
            <div className="mb-6">
                <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-2">
                    이름
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full h-10 px-3 border rounded-md text-sm bg-[#fafafa] focus:bg-white focus:outline-none transition-all ${
                        error || checkState.isDuplicate
                            ? 'border-[#ef4444]'
                            : checkState.isAvailable
                                ? 'border-[#2563eb] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'
                                : 'border-[#e5e5e5] focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'
                    }`}
                    placeholder="이름을 입력하세요"
                    disabled={isLoading}
                />
                {statusMessage && (
                    <p className={`mt-2 text-xs sm:text-sm ${statusMessage.className}`}>
                        {statusMessage.text}
                    </p>
                )}
            </div>

            {/* 검사 결과 */}
            {checkState.checkCompleted && !checkState.isChecking && (
                <div className="space-y-4">

                    {/* 유사한 사용자 목록 */}
                    {similarUsers.length > 0 && (
                        <UserList
                            users={similarUsers}
                            onSelectUser={handleSelectExistingUser}
                        />
                    )}


                    <div
                        className={"flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer transition-all"
                            + (checkState.isAvailable ? " hover:bg-gray-50 hover:border-blue-300 " : " opacity-50 cursor-not-allowed")}
                        onClick={checkState.isAvailable ? handleProceedAsNew : null}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">신규 사용자로 등록하기</p>
                            <div className="mt-1 text-xs sm:text-sm text-gray-600 space-y-1">
                                <span
                                    className="inline-block text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded mr-1">
                                        기존 수강 이력이 없는 새로운 계정으로 시작합니다.
                                </span>

                                {!checkState.isAvailable &&
                                    <span
                                        className="inline-block text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded mr-1">
                                    이미 사용 중인 이름입니다
                                </span>
                                }
                            </div>
                        </div>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>

                </div>
            )}



            {/* 안내 메시지 */}
            <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">안내사항</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 이름과 소속정보는 출석관리자가 사용자를 식별하는 데 사용됩니다.</li>
                    <li>• 교회 내 동명이인으로 인해 이름이 중복되는 경우 별명과 함께 등록해주세요</li>
                    <li className="px-3">예: 이정규(시광대담임목사) 서금옥(큐티) 등</li>
                    <li>• 교리반 등 이전 수강 데이터를 유지하시려면 <strong>"기존 등록 사용자"</strong>를 선택해주세요</li>
                    <li>• 그 외 사용문의는 시스템 담당자에게 문의해주세요 (문의하기)</li>
                </ul>
            </div>
        </div>
    )
}

export default Step1UsernameCheck