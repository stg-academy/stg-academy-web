import UserTable from "../components/tables/UserTable.jsx";
import { getUsersPaged, searchUsers, adminUpdateUser, adminResetPassword } from "../services/userService.js";
import { authAPI } from "../services/authService.js";
import { ROLES } from "../utils/roleUtils.js";
import { formatPhoneNumber, isValidPhoneNumber } from "../utils/phoneUtils.js";
import { useState, useEffect, useRef } from "react";
import PageContainer from "../components/ui/PageContainer.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorBanner from "../components/ui/ErrorBanner.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import Modal from "../components/ui/Modal.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";
import Icon from "../components/ui/Icon.jsx";

// UserTable.jsx의 DataTable itemsPerPage(30)와 반드시 같은 값을 유지해야 함
const USERS_PAGE_SIZE = 30
// 검색 결과 최대 개수 (검색은 페이지네이션 없이 전체 사용자 대상, 서버 검색 API의 limit)
const SEARCH_RESULT_LIMIT = 100

const UserManagementPage = () => {
    const [users, setUsers] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 사용자 검색 (서버사이드, 전체 사용자 대상 — 디바운스)
    const [searchTerm, setSearchTerm] = useState('')
    const searchDebounceRef = useRef(null)
    const isSearchActive = searchTerm.trim().length >= 2

    // 인라인 편집 상태
    const [editingUserId, setEditingUserId] = useState(null)
    const [editingData, setEditingData] = useState({})
    const [validationErrors, setValidationErrors] = useState({})

    const [addingUser, setAddingUser] = useState(false)

    // 비밀번호 초기화 관련 상태
    const [resetPasswordTarget, setResetPasswordTarget] = useState(null)
    const [resettingPassword, setResettingPassword] = useState(false)
    const [resetPasswordResult, setResetPasswordResult] = useState(null)
    const toast = useToast()

    const handleError = (message) => {
        setError(message)
        setTimeout(() => setError(''), 5000)
    }

    // 사용자 목록 로드 (서버사이드 페이지네이션)
    const loadUsersPage = async (page) => {
        try {
            setLoading(true)
            const { data, totalCount: total } = await getUsersPaged((page - 1) * USERS_PAGE_SIZE, USERS_PAGE_SIZE)
            setUsers(data)
            setTotalCount(total)
        } catch (err) {
            console.error('사용자 목록 조회 실패:', err)
            handleError('사용자 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 사용자 검색 (서버사이드, 전체 사용자 대상)
    const performSearch = async (term) => {
        try {
            setLoading(true)
            const results = await searchUsers(term, SEARCH_RESULT_LIMIT)
            setUsers(results)
        } catch (err) {
            console.error('사용자 검색 실패:', err)
            handleError('사용자 검색에 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 검색어 입력 핸들러 (디바운스, 2글자 미만이면 검색 종료하고 페이지 목록으로 복귀)
    const handleSearchChange = (value) => {
        setSearchTerm(value)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

        const trimmed = value.trim()
        if (trimmed.length < 2) {
            loadUsersPage(currentPage)
            return
        }

        searchDebounceRef.current = setTimeout(() => performSearch(trimmed), 400)
    }

    // 현재 보고 있는 화면(검색 결과 또는 페이지 목록) 새로고침
    const refreshCurrentView = async () => {
        const trimmed = searchTerm.trim()
        if (trimmed.length >= 2) {
            await performSearch(trimmed)
        } else {
            await loadUsersPage(currentPage)
        }
    }

    // 마운트 시 및 페이지 변경 시 해당 페이지 재조회
    useEffect(() => {
        loadUsersPage(currentPage)
    }, [currentPage])

    // 인라인 편집 시작
    const handleStartEdit = (user) => {
        setEditingUserId(user.id)
        setEditingData({
            username: user.username || '',
            information: user.information || '',
            phone_number: user.phone_number || '',
            is_active: user.is_active ?? true,
            role: user.authorizations?.role || ROLES.USER
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

        if (data.phone_number && data.phone_number.trim() !== '' && !isValidPhoneNumber(formatPhoneNumber(data.phone_number))) {
            errors.phone_number = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
        }

        return errors
    }

    // 변경 사항이 있는지 확인
    const hasChanges = (original, edited) => {
        // 기본 필드 비교
        const basicFields = ['username', 'information', 'phone_number', 'is_active']
        for (const key of basicFields) {
            if ((edited[key] ?? '') !== (original[key] ?? '')) {
                return true
            }
        }

        // 권한 필드 비교
        if (edited.role !== undefined && edited.role !== (original.authorizations?.role || ROLES.USER)) {
            return true
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
            // 권한 데이터를 올바른 형식으로 변환
            const updateData = {
                username: editingData.username,
                information: editingData.information,
                phone_number: editingData.phone_number ? formatPhoneNumber(editingData.phone_number) : '',
                is_active: editingData.is_active
            }

            // 권한이 변경된 경우 authorizations 필드 추가
            if (editingData.role !== undefined) {
                updateData.authorizations = { role: editingData.role }
            }

            await adminUpdateUser(userId, updateData)
            await refreshCurrentView()
            setEditingUserId(null)
            setEditingData({})
            setValidationErrors({})
        } catch (err) {
            console.error('사용자 정보 수정 실패:', err)
            handleError('사용자 정보 수정에 실패했습니다')
        }
    }

    // 새 사용자 추가 (즉시 편집 모드)
    const handleAddUser = async () => {
        try {
            setAddingUser(true)
            const newUserData = {
                username: `사용자_${totalCount + 1}`,
                information: '',
                auth: 'user'
            }
            const createdUser = (await authAPI.manualRegister(newUserData)).user

            if (createdUser?.id) {
                // 생성 응답에는 is_active가 빠져있을 수 있어(백엔드 기본값은 true) 보정해서 사용
                const normalizedUser = { ...createdUser, is_active: createdUser.is_active ?? true }

                // 페이지 단위 조회 중이라 새 사용자가 현재 페이지에 없을 수 있으므로,
                // 재조회 대신 응답으로 받은 사용자 정보를 현재 목록 맨 앞에 바로 반영
                setUsers(prev => [normalizedUser, ...prev])
                setTotalCount(prev => prev + 1)
                setEditingUserId(normalizedUser.id)
                setEditingData({
                    username: normalizedUser.username || '',
                    information: normalizedUser.information || '',
                    phone_number: normalizedUser.phone_number || '',
                    is_active: normalizedUser.is_active,
                    role: normalizedUser.authorizations?.role || ROLES.USER
                })
                setValidationErrors({})
            } else {
                await loadUsersPage(currentPage)
            }
        } catch (err) {
            console.error('사용자 생성 실패:', err)
            handleError('사용자 생성에 실패했습니다.')
        } finally {
            setAddingUser(false)
        }
    }

    // 비밀번호 초기화 확인 요청 (일반 로그인 계정만 UserTable에서 버튼이 노출됨)
    const handleResetPasswordClick = (user) => {
        setResetPasswordTarget(user)
    }

    // 비밀번호 초기화 실행
    const executeResetPassword = async () => {
        if (!resetPasswordTarget) return

        try {
            setResettingPassword(true)
            const response = await adminResetPassword(resetPasswordTarget.id)
            setResetPasswordResult({
                username: resetPasswordTarget.username,
                temporaryPassword: response.temporary_password
            })
        } catch (err) {
            console.error('비밀번호 초기화 실패:', err)
            if (err.status === 400) {
                handleError('카카오/수기 등록 계정은 비밀번호를 초기화할 수 없습니다.')
            } else {
                handleError('비밀번호 초기화에 실패했습니다')
            }
        } finally {
            setResettingPassword(false)
            setResetPasswordTarget(null)
        }
    }

    // 임시 비밀번호 복사
    const handleCopyTemporaryPassword = async () => {
        if (!resetPasswordResult) return
        try {
            await navigator.clipboard.writeText(resetPasswordResult.temporaryPassword)
            toast.success('임시 비밀번호가 복사되었습니다.')
        } catch (err) {
            console.error('클립보드 복사 실패:', err)
            toast.error('복사에 실패했습니다. 직접 선택해 복사해주세요.')
        }
    }

    return (
        <PageContainer>
            {/* 헤더 */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">사용자 관리</h1>
                    <p className="mt-2 text-neutral-600">
                        시스템 사용자를 관리하고 사용자 정보를 수정할 수 있습니다.
                    </p>
                </div>
                <Button onClick={handleAddUser} disabled={addingUser} className="flex items-center gap-2">
                    <Icon name="plus" size={20} />
                    <span>{addingUser ? '사용자 생성 중...' : '새 사용자 추가하기'}</span>
                </Button>
            </div>

            <ErrorBanner message={error} className="mb-6" />

            {/* 사용자 관리 테이블 */}
            <div className="bg-white rounded-lg border border-neutral-200">
                <UserTable
                    users={users}
                    loading={loading}
                    // 검색 (서버사이드, 전체 사용자 대상) — DataTable 내장 검색창을 제어
                    searchValue={searchTerm}
                    onSearchChange={handleSearchChange}
                    // 서버사이드 페이지네이션 (검색 중에는 false — 검색 결과(최대 100건) 내에서 클라이언트 페이지네이션)
                    serverPagination={!isSearchActive}
                    totalCount={totalCount}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    // 인라인 편집 관련 props
                    editingUserId={editingUserId}
                    editingData={editingData}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onEditChange={handleEditChange}
                    // 유효성 검사 관련 props
                    validationErrors={validationErrors}
                    // 비밀번호 초기화
                    onResetPassword={handleResetPasswordClick}
                />

                {/* 새 사용자 추가하기 */}
                <div className="px-6 py-4 border-t border-neutral-200">
                    <button
                        onClick={handleAddUser}
                        disabled={addingUser}
                        className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="plus" size={20} className="mr-2" />
                        <span className="text-sm font-medium">
                            {addingUser ? '사용자 생성 중...' : '새 사용자 추가하기'}
                        </span>
                    </button>
                </div>

                {/* 푸터 노트 */}
                <div className="px-6 py-4 bg-neutral-50 text-xs text-neutral-500 space-y-1">
                    <p>* 사용자 정보 수정은 편집 버튼을 통해 인라인으로 진행할 수 있습니다.</p>
                    <p>* 새 사용자 추가는 관리자 권한으로 수동 등록할 수 있습니다.</p>
                </div>
            </div>

            {/* 비밀번호 초기화 확인 */}
            <ConfirmModal
                isOpen={!!resetPasswordTarget}
                onClose={() => setResetPasswordTarget(null)}
                onConfirm={executeResetPassword}
                title="비밀번호 초기화"
                message={`'${resetPasswordTarget?.username}' 님의 비밀번호를 초기화하시겠습니까?\n기존 비밀번호는 더 이상 사용할 수 없습니다.`}
                confirmText={resettingPassword ? '처리 중...' : '초기화'}
                danger
            />

            {/* 임시 비밀번호 결과 */}
            <Modal
                isOpen={!!resetPasswordResult}
                onClose={() => setResetPasswordResult(null)}
                title="임시 비밀번호 발급"
                width="md:w-[420px]"
                footer={
                    <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setResetPasswordResult(null)}>
                            닫기
                        </Button>
                        <Button className="flex-1" onClick={handleCopyTemporaryPassword}>
                            복사하기
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-neutral-700 mb-3">
                    <span className="font-semibold">{resetPasswordResult?.username}</span> 님의 임시 비밀번호가 발급되었습니다.
                    이 비밀번호는 다시 확인할 수 없으니 지금 바로 사용자에게 전달해주세요.
                </p>
                <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-center">
                    <span className="text-lg font-mono font-semibold text-neutral-900 select-all">
                        {resetPasswordResult?.temporaryPassword}
                    </span>
                </div>
            </Modal>
        </PageContainer>
    )
}

export default UserManagementPage