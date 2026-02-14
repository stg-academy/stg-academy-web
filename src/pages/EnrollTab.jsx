import {useState} from 'react'
import {createEnroll, updateEnroll} from '../services/enrollService'
import {getUsersInfo} from '../services/userService'
import EnrollTable from '../components/tables/EnrollTable'
import Modal from '../components/ui/Modal'
import SelectInput from '../components/forms/SelectInput'

const EnrollTab = ({
    session,
    enrolls,
    enrollsLoading,
    onError,
    onRefreshEnrolls,
    loading
}) => {
    const [addStudentModal, setAddStudentModal] = useState({isOpen: false})
    const [selectedUser, setSelectedUser] = useState(null)
    const [newStudentStatus, setNewStudentStatus] = useState('ACTIVE')
    const [userSearchTerm, setUserSearchTerm] = useState('')
    const [allUsers, setAllUsers] = useState([])
    const [userSearchResults, setUserSearchResults] = useState([])
    const [userSearchLoading, setUserSearchLoading] = useState(false)
    const [usersLoaded, setUsersLoaded] = useState(false)
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [editEnrollModal, setEditEnrollModal] = useState({isOpen: false, enrollment: null})
    const [editStatus, setEditStatus] = useState('ACTIVE')


    // 모다 열 때 사용자 목록 로드
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

    // 수강생 추가 모달 열기
    const handleAddStudent = async () => {
        setAddStudentModal({isOpen: true})
        setSelectedUser(null)
        setNewStudentStatus('ACTIVE')
        setUserSearchTerm('')
        setUserSearchResults([])
        setShowUserDropdown(false)

        // 모달 열 때 사용자 목록 로드
        await loadAllUsers()
    }

    // 수강생 추가 모달 닫기
    const handleCloseAddModal = () => {
        setAddStudentModal({isOpen: false})
        setSelectedUser(null)
        setNewStudentStatus('ACTIVE')
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

        // 클라이언트 사이드에서 필터링
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

    // 수강생 추가 저장
    const handleSaveStudent = async () => {
        if (!selectedUser) {
            onError('사용자를 선택해주세요')
            return
        }

        // 중복 수강 신청 확인
        const isAlreadyEnrolled = enrolls.some(enroll =>
            enroll.user_id === selectedUser.id ||
            enroll.user?.id === selectedUser.id
        )

        if (isAlreadyEnrolled) {
            onError('이미 수강 신청된 학생입니다.')
            return
        }

        try {
            await createEnroll({
                user_id: selectedUser.id,
                session_id: session.id,
                enroll_status: newStudentStatus
            })
            if (onRefreshEnrolls) {
                await onRefreshEnrolls()
            }
            handleCloseAddModal()
        } catch (err) {
            console.error('수강생 추가 실패:', err)
            onError('수강생 추가에 실패했습니다')
        }
    }

    // 수강 상태 옵션
    const enrollStatusOptions = [
        {value: 'ACTIVE', label: '활성'},
        {value: 'INACTIVE', label: '비활성'},
        {value: 'DROPPED', label: '중도포기'}
    ]

    // 수강 정보 편집 핸들러
    const handleEditEnrollment = (enrollment) => {
        setEditEnrollModal({isOpen: true, enrollment})
        setEditStatus(enrollment.enroll_status || 'ACTIVE')
    }

    // 수강 정보 편집 모달 닫기
    const handleCloseEditModal = () => {
        setEditEnrollModal({isOpen: false, enrollment: null})
        setEditStatus('ACTIVE')
    }

    // 수강 정보 수정 저장
    const handleSaveEnrollmentEdit = async () => {
        const {enrollment} = editEnrollModal
        if (!enrollment) return

        try {
            // API를 사용하여 수강 정보 수정
            await updateEnroll(enrollment.id, {
                enroll_status: editStatus
            })

            // 수정 성공 후 목록 새로고침
            if (onRefreshEnrolls) {
                await onRefreshEnrolls()
            }
            handleCloseEditModal()
        } catch (err) {
            console.error('수강 정보 수정 실패:', err)
            onError('수강 정보 수정에 실패했습니다')
        }
    }

    // 학생 삭제 핸들러 (추후 구현)
    const handleDeleteStudent = (enrollId) => {
        console.log('삭제 기능 구현 예정:', enrollId)
        // TODO: 학생 삭제 기능 구현
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">수강생 목록</h3>
                <button
                    onClick={handleAddStudent}
                    disabled={enrollsLoading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>수강생 추가</span>
                </button>
            </div>

            {/* 수강생 테이블 */}
            <div >
                <EnrollTable
                    enrolls={enrolls}
                    loading={loading || enrollsLoading}
                    onEditEnrollment={handleEditEnrollment}
                    onDeleteStudent={handleDeleteStudent}
                />
            </div>

            {/* 수강생 추가 모달 */}
            <Modal
                isOpen={addStudentModal.isOpen}
                onClose={handleCloseAddModal}
                title="수강생 추가"
                onSubmit={handleSaveStudent}
                submitText="추가"
                loadingText="추가 중..."
            >
                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            사용자 검색 <span className="text-red-500">*</span>
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
                                placeholder="사용자 이름 또는 이메일로 검색"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            {userSearchLoading && !usersLoaded && (
                                <div className="absolute right-3 top-3">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>

                        {/* 검색 결과 드롭다운 */}
                        {showUserDropdown && userSearchResults.length > 0 && (
                            <div
                                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {userSearchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{user.username}</span>
                                            {user.information && (
                                                <span className="text-xs text-gray-400">{user.information}</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 선택된 사용자 표시 */}
                        {selectedUser && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            선택된 사용자: {selectedUser.username}
                                        </p>
                                        {selectedUser.information && (
                                            <p className="text-xs text-blue-600">{selectedUser.information}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedUser(null)
                                            setUserSearchTerm('')
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                            {!usersLoaded && userSearchLoading
                                ? '사용자 목록을 불러오는 중...'
                                : '2글자 이상 입력하면 검색 결과가 표시됩니다 (총 {allUsers.length}명)'
                            }
                        </p>
                    </div>

                    <SelectInput
                        id="student-status"
                        name="studentStatus"
                        label="수강 상태"
                        value={newStudentStatus}
                        onChange={(e) => setNewStudentStatus(e.target.value)}
                        options={enrollStatusOptions}
                        required
                    />
                </div>
            </Modal>

            {/* 수강 정보 편집 모달 */}
            <Modal
                isOpen={editEnrollModal.isOpen}
                onClose={handleCloseEditModal}
                title="수강 정보 편집"
                onSubmit={handleSaveEnrollmentEdit}
                submitText="수정"
                loadingText="수정 중..."
            >
                <div className="space-y-4">
                    {editEnrollModal.enrollment && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                학생 정보
                            </h4>
                            <div className="text-sm text-gray-600">
                                <p>이름: {editEnrollModal.enrollment.user_name || '-'}</p>
                                {/*<p>계정 상태: {(editEnrollModal.enrollment.user?.is_active ?? editEnrollModal.enrollment.user_is_active) ? '활성' : '비활성'}</p>*/}
                            </div>
                        </div>
                    )}

                    <SelectInput
                        id="edit-enrollment-status"
                        name="editEnrollmentStatus"
                        label="수강 상태"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        options={enrollStatusOptions}
                        required
                    />
                </div>
            </Modal>
        </div>
    )
}

export default EnrollTab