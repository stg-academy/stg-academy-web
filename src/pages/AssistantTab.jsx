import {useState} from 'react'
import {createAssistant, deleteAssistant} from '../services/assistantService'
import {getUsersInfo} from '../services/userService'
import AssistantTable from '../components/tables/AssistantTable'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Button from '../components/ui/Button.jsx'
import PageSectionHeader from '../components/ui/PageSectionHeader.jsx'

const AssistantTab = ({
    session,
    assistants,
    assistantsLoading,
    onError,
    onRefreshAssistants,
    loading
}) => {
    const [addModal, setAddModal] = useState({isOpen: false})
    const [selectedUser, setSelectedUser] = useState(null)
    const [userSearchTerm, setUserSearchTerm] = useState('')
    const [allUsers, setAllUsers] = useState([])
    const [userSearchResults, setUserSearchResults] = useState([])
    const [userSearchLoading, setUserSearchLoading] = useState(false)
    const [usersLoaded, setUsersLoaded] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [removeTarget, setRemoveTarget] = useState(null)

    // 모달 열 때 사용자 목록 로드
    const loadAllUsers = async () => {
        if (usersLoaded) return // 이미 로드되었으면 스킵

        setUserSearchLoading(true)
        try {
            const users = await getUsersInfo(0, 1000) // 대용량 조회
            setAllUsers(users)
            setUsersLoaded(true)
        } catch (err) {
            console.error('사용자 목록 로드 실패:', err)
            onError('사용자 목록을 불러오는데 실패했습니다')
        } finally {
            setUserSearchLoading(false)
        }
    }

    // 조교 추가 모달 열기
    const handleAddAssistant = async () => {
        setAddModal({isOpen: true})
        setSelectedUser(null)
        setUserSearchTerm('')
        setUserSearchResults([])
        setShowUserDropdown(false)

        await loadAllUsers()
    }

    // 조교 추가 모달 닫기
    const handleCloseAddModal = () => {
        setAddModal({isOpen: false})
        setSelectedUser(null)
        setUserSearchTerm('')
        setUserSearchResults([])
        setShowUserDropdown(false)
    }

    // 사용자 검색 (클라이언트 사이드 필터링)
    const handleUserSearch = (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) {
            setUserSearchResults([])
            setShowUserDropdown(false)
            return
        }

        const filteredUsers = allUsers.filter(user =>
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.information?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        setUserSearchResults(filteredUsers)
        setShowUserDropdown(filteredUsers.length > 0)
    }

    // 사용자 선택
    const handleSelectUser = (user) => {
        setSelectedUser(user)
        setUserSearchTerm(user.username)
        setShowUserDropdown(false)
    }

    // 조교 추가 저장
    const handleSaveAssistant = async () => {
        if (!selectedUser) {
            onError('사용자를 선택해주세요')
            return
        }

        // 중복 등록 확인
        const isAlreadyAssistant = assistants.some(assistant => assistant.user_id === selectedUser.id)
        if (isAlreadyAssistant) {
            onError('이미 조교로 등록된 사용자입니다.')
            return
        }

        try {
            await createAssistant(session.id, selectedUser.id)
            if (onRefreshAssistants) {
                await onRefreshAssistants()
            }
            handleCloseAddModal()
        } catch (err) {
            console.error('조교 등록 실패:', err)
            onError('조교 등록에 실패했습니다')
        }
    }

    // 조교 해제 확인 요청
    const handleRemoveAssistant = (assistant) => {
        setRemoveTarget(assistant)
    }

    // 조교 해제 확정 실행
    const executeRemoveAssistant = async () => {
        const target = removeTarget
        setRemoveTarget(null)
        if (!target) return

        try {
            await deleteAssistant(session.id, target.user_id)
            if (onRefreshAssistants) {
                await onRefreshAssistants()
            }
        } catch (err) {
            console.error('조교 해제 실패:', err)
            onError('조교 해제에 실패했습니다')
        }
    }

    return (
        <div>
            <PageSectionHeader
                title="조교 관리"
                action={
                    <Button onClick={handleAddAssistant} disabled={assistantsLoading} className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4v16m8-8H4"/>
                        </svg>
                        <span>조교 추가</span>
                    </Button>
                }
            />

            <AssistantTable
                assistants={assistants}
                loading={loading || assistantsLoading}
                onRemoveAssistant={handleRemoveAssistant}
            />

            {/* 조교 추가 모달 */}
            <Modal
                isOpen={addModal.isOpen}
                onClose={handleCloseAddModal}
                title="조교 추가"
                onSubmit={handleSaveAssistant}
                submitText="추가"
                loadingText="추가 중..."
            >
                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            사용자 검색 <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={userSearchTerm}
                                onChange={(e) => {
                                    setUserSearchTerm(e.target.value)
                                    handleUserSearch(e.target.value)
                                }}
                                disabled={userSearchLoading && !usersLoaded}
                                placeholder="사용자 이름 또는 소속으로 검색"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                                required
                            />
                            {userSearchLoading && !usersLoaded && (
                                <div className="absolute right-3 top-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                                </div>
                            )}
                        </div>

                        {/* 검색 결과 드롭다운 */}
                        {showUserDropdown && userSearchResults.length > 0 && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {userSearchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-neutral-900">{user.username}</span>
                                            {user.information && (
                                                <span className="text-xs text-neutral-400">{user.information}</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 선택된 사용자 표시 */}
                        {selectedUser && (
                            <div className="mt-2 p-3 bg-accent-soft border border-accent/20 rounded-md">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-accent-hover">
                                            선택된 사용자: {selectedUser.username}
                                        </p>
                                        {selectedUser.information && (
                                            <p className="text-xs text-accent">{selectedUser.information}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedUser(null)
                                            setUserSearchTerm('')
                                        }}
                                        className="text-accent hover:text-accent-hover"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="mt-1 text-xs text-neutral-500">
                            {!usersLoaded && userSearchLoading
                                ? '사용자 목록을 불러오는 중...'
                                : `2글자 이상 입력하면 검색 결과가 표시됩니다 (총 ${allUsers.length}명)`
                            }
                        </p>
                    </div>
                </div>
            </Modal>

            {/* 조교 해제 확인 모달 */}
            <ConfirmModal
                isOpen={!!removeTarget}
                onClose={() => setRemoveTarget(null)}
                onConfirm={executeRemoveAssistant}
                title="조교 해제"
                message={`${removeTarget?.username || '해당 사용자'}를 조교에서 해제하시겠습니까?`}
                confirmText="해제"
                danger
            />
        </div>
    )
}

export default AssistantTab
