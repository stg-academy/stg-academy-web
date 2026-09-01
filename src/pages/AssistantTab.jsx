import {useRef, useState} from 'react'
import {createAssistant, deleteAssistant} from '../services/assistantService'
import {searchUsers} from '../services/userService'
import AssistantTable from '../components/tables/AssistantTable'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Button from '../components/ui/Button.jsx'
import PageSectionHeader from '../components/ui/PageSectionHeader.jsx'
import Icon from '../components/ui/Icon.jsx'
import {formatNameWithPhone} from '../utils/phoneUtils.js'

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
    const [userSearchResults, setUserSearchResults] = useState([])
    const [userSearchLoading, setUserSearchLoading] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [removeTarget, setRemoveTarget] = useState(null)
    const userSearchDebounceRef = useRef(null)

    // 조교 추가 모달 열기
    const handleAddAssistant = () => {
        setAddModal({isOpen: true})
        setSelectedUser(null)
        setUserSearchTerm('')
        setUserSearchResults([])
        setShowUserDropdown(false)
    }

    // 조교 추가 모달 닫기
    const handleCloseAddModal = () => {
        if (userSearchDebounceRef.current) clearTimeout(userSearchDebounceRef.current)
        setAddModal({isOpen: false})
        setSelectedUser(null)
        setUserSearchTerm('')
        setUserSearchResults([])
        setShowUserDropdown(false)
    }

    // 사용자 검색 (서버사이드, 디바운스)
    const handleUserSearch = (searchTerm) => {
        if (userSearchDebounceRef.current) clearTimeout(userSearchDebounceRef.current)

        if (!searchTerm || searchTerm.length < 2) {
            setUserSearchResults([])
            setShowUserDropdown(false)
            return
        }

        userSearchDebounceRef.current = setTimeout(async () => {
            setUserSearchLoading(true)
            try {
                const results = await searchUsers(searchTerm, 20)
                setUserSearchResults(results)
                setShowUserDropdown(results.length > 0)
            } catch (err) {
                console.error('사용자 검색 실패:', err)
                onError('사용자 검색에 실패했습니다')
            } finally {
                setUserSearchLoading(false)
            }
        }, 400)
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
                        <Icon name="plus" size={20} />
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
                                placeholder="사용자 이름 또는 소속으로 검색"
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                                required
                            />
                            {userSearchLoading && (
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
                                            <span className="font-medium text-neutral-900">{formatNameWithPhone(user.username, user.phone_number)}</span>
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
                                            선택된 사용자: {formatNameWithPhone(selectedUser.username, selectedUser.phone_number)}
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
                                        <Icon name="x" size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="mt-1 text-xs text-neutral-500">
                            2글자 이상 입력하면 검색 결과가 표시됩니다.
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
                message={`${formatNameWithPhone(removeTarget?.username, removeTarget?.phone_number) || '해당 사용자'}를 조교에서 해제하시겠습니까?`}
                confirmText="해제"
                danger
            />
        </div>
    )
}

export default AssistantTab
