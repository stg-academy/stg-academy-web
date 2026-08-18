import {useEffect, useState} from 'react'
import {createEnroll, updateEnroll} from '../services/enrollService'
import {getUsersInfo} from '../services/userService'
import {getCertifications, createCertification, getCertificationPreview, getCertificationDownload} from '../services/certificationService'
import EnrollTable from '../components/tables/EnrollTable'
import Modal from '../components/ui/Modal'
import SelectInput from '../components/forms/SelectInput'
import Button from '../components/ui/Button.jsx'
import PageSectionHeader from '../components/ui/PageSectionHeader.jsx'
import {useToast} from '../components/ui/ToastProvider.jsx'

const formatDate = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
    })
}

// 다운로드 헤더 파싱에 실패했을 때 쓰는 클라이언트 생성 파일명 (백엔드 규칙과 동일)
const buildFallbackFilename = (cert) => {
    const safeCourse = (cert.course_title || '수료증').replace(/[\\/:*?"<>|\s]+/g, '_')
    const yyyymmdd = cert.issued_at ? new Date(cert.issued_at).toISOString().slice(0, 10).replace(/-/g, '') : ''
    return `certification_${safeCourse}_${yyyymmdd}.png`
}

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
    const [certifications, setCertifications] = useState([])
    const [certificationsLoading, setCertificationsLoading] = useState(false)
    const [certificateDetailModal, setCertificateDetailModal] = useState({isOpen: false, certification: null})
    const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null)
    const [certificatePreviewLoading, setCertificatePreviewLoading] = useState(false)
    const [certificateDownloading, setCertificateDownloading] = useState(false)

    const toast = useToast()

    // 이 세션의 수료증 목록 로드
    useEffect(() => {
        loadCertifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.id])

    const loadCertifications = async () => {
        if (!session?.id) return
        try {
            setCertificationsLoading(true)
            const data = await getCertifications(0, 1000)
            setCertifications(data.filter(cert => cert.session_id === session.id))
        } catch (err) {
            console.error('수료증 목록 조회 실패:', err)
            onError('수료증 목록을 불러오는데 실패했습니다')
        } finally {
            setCertificationsLoading(false)
        }
    }

    // 수료증 발급
    const handleIssueCertification = async (enrollRow) => {
        try {
            await createCertification(session.id, enrollRow.user_id)
            toast.success('수료증이 발급되었습니다.')
            await loadCertifications()
        } catch (err) {
            console.error('수료증 발급 실패:', err)
            onError(err.status === 409 ? '이미 발급된 수료증입니다' : '수료증 발급에 실패했습니다')
        }
    }

    // 수료증 조회 — 상세 정보(리스트 조회 시 받은 cert 객체, 추가 호출 없음) + 실제 이미지 미리보기
    const handleViewCertification = async (row, cert) => {
        setCertificateDetailModal({isOpen: true, certification: cert})
        setCertificatePreviewLoading(true)
        try {
            const {blob} = await getCertificationPreview(cert.id)
            setCertificatePreviewUrl(URL.createObjectURL(blob))
        } catch (err) {
            console.error('수료증 미리보기 조회 실패:', err)
            onError('수료증 미리보기를 불러오는데 실패했습니다')
        } finally {
            setCertificatePreviewLoading(false)
        }
    }

    const handleCloseCertificateDetailModal = () => {
        if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl)
        setCertificateDetailModal({isOpen: false, certification: null})
        setCertificatePreviewUrl(null)
    }

    // 수료증 다운로드
    const handleDownloadCertificate = async () => {
        const cert = certificateDetailModal.certification
        if (!cert) return

        setCertificateDownloading(true)
        try {
            const {blob, filename} = await getCertificationDownload(cert.id)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename || buildFallbackFilename(cert)
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('수료증 다운로드 실패:', err)
            onError('수료증 다운로드에 실패했습니다')
        } finally {
            setCertificateDownloading(false)
        }
    }

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
            <PageSectionHeader
                title="수강생 목록"
                action={
                    <Button onClick={handleAddStudent} disabled={enrollsLoading} className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4v16m8-8H4"/>
                        </svg>
                        <span>수강생 추가</span>
                    </Button>
                }
            />

            {/* 수강생 테이블 */}
            <div >
                <EnrollTable
                    enrolls={enrolls}
                    loading={loading || enrollsLoading || certificationsLoading}
                    onEditEnrollment={handleEditEnrollment}
                    onDeleteStudent={handleDeleteStudent}
                    certifications={certifications}
                    onIssueCertification={handleIssueCertification}
                    onViewCertification={handleViewCertification}
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
                                placeholder="사용자 이름 또는 이메일로 검색"
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
                        <div className="mb-4 p-3 bg-neutral-50 rounded-md">
                            <h4 className="text-sm font-medium text-neutral-900 mb-2">
                                학생 정보
                            </h4>
                            <div className="text-sm text-neutral-600">
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

            {/* 수료증 상세 모달 */}
            <Modal
                isOpen={certificateDetailModal.isOpen}
                onClose={handleCloseCertificateDetailModal}
                title="수료증 상세"
                footer={
                    <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={handleCloseCertificateDetailModal}>
                            닫기
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={certificateDownloading || !certificateDetailModal.certification}
                            onClick={handleDownloadCertificate}
                        >
                            {certificateDownloading ? '다운로드 중...' : '다운로드'}
                        </Button>
                    </div>
                }
            >
                {certificateDetailModal.certification && (
                    <div className="space-y-4">
                        <div className="w-full aspect-[2520/1000] bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center">
                            {certificatePreviewLoading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                            ) : certificatePreviewUrl ? (
                                <img
                                    src={certificatePreviewUrl}
                                    alt={`${certificateDetailModal.certification.course_title} 수료증`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-xs text-neutral-400">미리보기를 불러올 수 없습니다</span>
                            )}
                        </div>

                        <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">과정명</span>
                            <span className="text-neutral-900 font-medium">{certificateDetailModal.certification.course_title || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">강좌명</span>
                            <span className="text-neutral-900 font-medium">{certificateDetailModal.certification.session_title || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">강사</span>
                            <span className="text-neutral-900">{certificateDetailModal.certification.lecturer_info || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">수강 기간</span>
                            <span className="text-neutral-900">
                                {formatDate(certificateDetailModal.certification.session_begin_date)} ~ {formatDate(certificateDetailModal.certification.session_end_date)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-neutral-100 pt-3">
                            <span className="text-neutral-500">발급일</span>
                            <span className="text-neutral-900 font-medium">{formatDate(certificateDetailModal.certification.issued_at)}</span>
                        </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default EnrollTab