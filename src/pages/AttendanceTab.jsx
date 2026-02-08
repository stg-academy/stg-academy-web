import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import {createAttendance, getAttendancesBySession, updateAttendance} from '../services/attendanceService'
import {getAttendanceOptions} from '../utils/attendanceStatus'
import AttendanceTable from '../components/tables/AttendanceTable'
import Modal from '../components/ui/Modal'
import SelectInput from '../components/forms/SelectInput'
import TextareaInput from '../components/forms/TextareaInput'

const AttendanceTab = ({
                           session,
                           lectures,
                           onError,
                           loading
                       }) => {
    const {user} = useAuth()

    const [attendances, setAttendances] = useState([])
    const [attendancesLoading, setAttendancesLoading] = useState(false)
    const [cellUpdateLoading, setCellUpdateLoading] = useState(false)
    const [editModal, setEditModal] = useState({isOpen: false, cellInfo: null})
    const [selectedStatus, setSelectedStatus] = useState('PRESENT')
    const [note, setNote] = useState('')

    const attendanceOptions = getAttendanceOptions()

    // 출석 목록 로드
    useEffect(() => {
        loadAttendances()
    }, [session])

    const loadAttendances = async () => {
        try {
            setAttendancesLoading(true)
            const data = await getAttendancesBySession(session.id)
            setAttendances(data)
        } catch (err) {
            console.error('출석 목록 조회 실패:', err)
            onError('출석 목록을 불러오는데 실패했습니다')
        } finally {
            setAttendancesLoading(false)
        }
    }

    // 셀 클릭 핸들러
    const handleCellClick = (cellInfo) => {
        setEditModal({isOpen: true, cellInfo})
        setSelectedStatus(cellInfo?.attendance?.status || 'PRESENT')
        setNote(cellInfo?.attendance?.note || '')
    }

    // 모달 닫기
    const handleCloseModal = () => {
        setEditModal({isOpen: false, cellInfo: null})
        setSelectedStatus('PRESENT')
        setNote('')
    }

    // 출석 상태 저장
    const handleSaveAttendance = async () => {
        const {cellInfo} = editModal
        if (!cellInfo) return

        setCellUpdateLoading(true)
        try {
            if (cellInfo.attendance?.id) {
                // 기존 출석 수정
                await updateAttendance(cellInfo.attendance.id, {
                    status: selectedStatus,
                    detail_type: selectedStatus,
                    description: note
                })
            } else {
                // 새 출석 생성
                await createAttendance(cellInfo.lectureId, {
                    user_id: cellInfo.userId,
                    status: selectedStatus,
                    detail_type: selectedStatus,
                    description: note
                })
            }
            await loadAttendances()
        } catch (err) {
            console.error('출석 정보 업데이트 실패:', err)
            onError('출석 정보 업데이트에 실패했습니다')
        } finally {
            setCellUpdateLoading(false)
        }
    }

    return (<div className="bg-white rounded-lg shadow ">

            {/* 출석부 테이블 */}
            <AttendanceTable
                attendances={attendances}
                lectures={lectures}
                onCellClick={handleCellClick}
                loading={loading && attendancesLoading}
                cellUpdateLoading={cellUpdateLoading}
                className="min-h-[500px]"
            />

            {/* 출석 상태 편집 모달 */}
            <Modal
                isOpen={editModal.isOpen}
                onClose={handleCloseModal}
                title="출석 상태 편집"
                onSubmit={handleSaveAttendance}
                disabled={cellUpdateLoading}
                submitText="저장"
                loadingText="저장 중..."
            >

                <div className="space-y-4">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>{editModal.cellInfo?.userName}</strong> - {editModal.cellInfo?.lectureTitle}
                        </p>
                    </div>

                    <SelectInput
                        id="attendance-status"
                        name="attendanceStatus"
                        label="출석 상태"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={attendanceOptions}
                        required
                    />

                    <TextareaInput
                        id="attendance-note"
                        name="attendanceNote"
                        label="비고"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="추가 메모를 입력하세요..."
                        rows={3}
                    />
                </div>

            </Modal>
        </div>
    )
}

export default AttendanceTab