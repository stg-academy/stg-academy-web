import UserTable from "../components/tables/UserTable.jsx";
import { getUsers, updateUser } from "../services/userService.js";
import { useState, useEffect } from "react";

const UserManagementPage = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 인라인 편집 상태
    const [editingUserId, setEditingUserId] = useState(null)
    const [editingData, setEditingData] = useState({})
    const [validationErrors, setValidationErrors] = useState({})

    const handleError = (message) => {
        setError(message)
        setTimeout(() => setError(''), 5000)
    }

    // 사용자 목록 로드
    const loadUsers = async () => {
        try {
            setLoading(true)
            const data = await getUsers(0, 1000) // 모든 사용자 조회
            setUsers(data)
        } catch (err) {
            console.error('사용자 목록 조회 실패:', err)
            handleError('사용자 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 컴포넌트 마운트 시 사용자 목록 로드
    useEffect(() => {
        loadUsers()
    }, [])

    // 인라인 편집 시작
    const handleStartEdit = (user) => {
        setEditingUserId(user.id)
        setEditingData({
            username: user.username || '',
            information: user.information || '',
            is_active: user.is_active ?? true
        })
        setValidationErrors({})
    }

    // 인라인 편집 취소
    const handleCancelEdit = () => {
        setEditingUserId(null)
        setEditingData({})
        setValidationErrors({})
    }

    // 인라인 편집 데이터 변경
    const handleEditChange = (field, value) => {
        setEditingData(prev => ({
            ...prev,
            [field]: value
        }))

        // 필드 변경 시 해당 필드의 오류 제거
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = {...prev}
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // 유효성 검사 함수
    const validateUserData = (data) => {
        const errors = {}

        if (!data.username || data.username.trim() === '') {
            errors.username = '사용자명은 필수 입력 항목입니다.'
        }

        return errors
    }

    // 변경 사항이 있는지 확인
    const hasChanges = (original, edited) => {
        for (const key in edited) {
            if (edited[key] !== original[key] && !(edited[key] == null && original[key] === '')) {
                return true
            }
        }
        return false
    }

    // 인라인 편집 저장
    const handleSaveEdit = async (userId) => {
        // 유효성 검사 수행
        const errors = validateUserData(editingData)

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return // 오류가 있으면 저장하지 않음
        }

        const originalUser = users.find(user => user.id === userId)
        if (!hasChanges(originalUser, editingData)) {
            setEditingUserId(null)
            setEditingData({})
            setValidationErrors({})
            return // 변경 사항이 없으면 저장하지 않음
        }

        try {
            await updateUser(userId, editingData)
            await loadUsers() // 목록 새로고침
            setEditingUserId(null)
            setEditingData({})
            setValidationErrors({})
        } catch (err) {
            console.error('사용자 정보 수정 실패:', err)
            handleError('사용자 정보 수정에 실패했습니다')
        }
    }

    // 새 사용자 추가 (추후 구현)
    const handleAddUser = () => {
        handleError('사용자 생성 기능은 아직 구현되지 않았습니다')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-8 md:px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
                    <p className="mt-2 text-gray-600">
                        시스템 사용자를 관리하고 사용자 정보를 수정할 수 있습니다.
                    </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* 사용자 관리 테이블 */}
                <div className="bg-white rounded-lg shadow">
                    <UserTable
                        users={users}
                        loading={loading}
                        // 인라인 편집 관련 props
                        editingUserId={editingUserId}
                        editingData={editingData}
                        onStartEdit={handleStartEdit}
                        onCancelEdit={handleCancelEdit}
                        onSaveEdit={handleSaveEdit}
                        onEditChange={handleEditChange}
                        // 유효성 검사 관련 props
                        validationErrors={validationErrors}
                    />

                    {/* 새 사용자 추가하기 */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <button
                            onClick={handleAddUser}
                            className="flex items-center text-gray-400 cursor-not-allowed transition-colors"
                            disabled
                            title="사용자 생성 기능은 추후 구현 예정입니다"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 4v16m8-8H4"/>
                            </svg>
                            <span className="text-sm font-medium">새 사용자 추가하기 (추후 구현 예정)</span>
                        </button>
                    </div>

                    {/* 푸터 노트 */}
                    <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 space-y-1">
                        <p>* 사용자 정보 수정은 편집 버튼을 통해 인라인으로 진행할 수 있습니다.</p>
                        <p>* 사용자 생성 기능은 백엔드 API 개발 완료 후 추가될 예정입니다.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default UserManagementPage