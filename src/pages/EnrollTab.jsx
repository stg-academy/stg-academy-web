import {useEffect, useState} from 'react'
import {getEnrollsBySession, createEnroll} from '../services/enrollService'
import EnrollTable from '../components/tables/EnrollTable'
import Modal from '../components/ui/Modal'
import SelectInput from '../components/forms/SelectInput'

const EnrollTab = ({
    session,
    onError,
    loading
}) => {
    const [enrolls, setEnrolls] = useState([])
    const [enrollsLoading, setEnrollsLoading] = useState(false)
    const [addStudentModal, setAddStudentModal] = useState({isOpen: false})
    const [newStudentUserId, setNewStudentUserId] = useState('')
    const [newStudentStatus, setNewStudentStatus] = useState('ACTIVE')

    // 수강생 목록 로드
    useEffect(() => {
        if (session?.id) {
            loadEnrolls()
        }
    }, [session])

    const loadEnrolls = async () => {
        try {
            setEnrollsLoading(true)
            const data = await getEnrollsBySession(session.id)
            setEnrolls(data)
        } catch (err) {
            console.error('수강생 목록 조회 실패:', err)
            onError('수강생 목록을 불러오는데 실패했습니다')
        } finally {
            setEnrollsLoading(false)
        }
    }

    // 수강생 추가 모달 열기
    const handleAddStudent = () => {
        setAddStudentModal({isOpen: true})
        setNewStudentUserId('')
        setNewStudentStatus('ACTIVE')
    }

    // 수강생 추가 모달 닫기
    const handleCloseAddModal = () => {
        setAddStudentModal({isOpen: false})
        setNewStudentUserId('')
        setNewStudentStatus('ACTIVE')
    }

    // 수강생 추가 저장
    const handleSaveStudent = async () => {
        if (!newStudentUserId) {
            onError('사용자 ID를 입력해주세요')
            return
        }

        try {
            await createEnroll({
                user_id: newStudentUserId,
                session_id: session.id,
                status: newStudentStatus
            })
            await loadEnrolls()
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
        {value: 'COMPLETED', label: '완료'},
        {value: 'DROPPED', label: '중도포기'}
    ]

    // 학생 편집 핸들러 (추후 구현)
    const handleEditStudent = (student) => {
        console.log('편집 기능 구현 예정:', student)
        // TODO: 학생 정보 편집 모달 구현
    }

    // 학생 삭제 핸들러 (추후 구현)
    const handleDeleteStudent = (enrollId) => {
        console.log('삭제 기능 구현 예정:', enrollId)
        // TODO: 학생 삭제 기능 구현
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <span>👥 수강생 목록</span>
                        {enrollsLoading && (
                            <span className="text-sm text-blue-600 animate-pulse">로딩 중...</span>
                        )}
                    </h3>

                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600">
                            총 {enrolls.length}명
                        </div>
                        <button
                            onClick={handleAddStudent}
                            disabled={enrollsLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + 수강생 추가
                        </button>
                    </div>
                </div>
            </div>

            {/* 수강생 테이블 */}
            <div className="p-6">
                <EnrollTable
                    enrolls={enrolls}
                    loading={loading || enrollsLoading}
                    onEditStudent={handleEditStudent}
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            사용자 ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={newStudentUserId}
                            onChange={(e) => setNewStudentUserId(e.target.value)}
                            placeholder="사용자 UUID를 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            추후 사용자 검색 기능으로 개선 예정
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
        </div>
    )
}

export default EnrollTab