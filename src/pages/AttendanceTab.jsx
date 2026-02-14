import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import {createAttendance, getAttendancesBySession, updateAttendance} from '../services/attendanceService'
import AttendanceTable from '../components/tables/AttendanceTable'
import AttendanceEditModal from '../components/modals/AttendanceEditModal'
import BulkAttendanceEditModal from '../components/modals/BulkAttendanceEditModal'

const AttendanceTab = ({
                           session,
                           lectures,
                           enrolls,
                           enrollsLoading,
                           onError,
                           loading
                       }) => {
    const {user} = useAuth()

    const [attendances, setAttendances] = useState([])
    const [attendancesLoading, setAttendancesLoading] = useState(false)
    const [activeEnrolls, setActiveEnrolls] = useState([])
    const [cellUpdateLoading, setCellUpdateLoading] = useState(false)
    const [editModal, setEditModal] = useState({isOpen: false, cellInfo: null})
    const [selectedStatus, setSelectedStatus] = useState('PRESENT')
    const [note, setNote] = useState('')
    const [bulkEditModal, setBulkEditModal] = useState({isOpen: false, selectedCells: []})
    const [bulkStatus, setBulkStatus] = useState('PRESENT')
    const [bulkNote, setBulkNote] = useState('')
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)

    // 수강생 목록에서 활성 상태인 수강생들만 필터링
    useEffect(() => {
        if (enrolls && enrolls.length > 0) {
            const activeStudents = enrolls.filter(enroll => enroll.enroll_status === 'ACTIVE')
            setActiveEnrolls(activeStudents)
        }
    }, [enrolls])

    // 출석 목록 로드
    useEffect(() => {
        if (session?.id) {
            loadAttendances()
        }
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

    // 일괄 편집 모달 닫기
    const handleCloseBulkModal = () => {
        setBulkEditModal({isOpen: false, selectedCells: []})
        setBulkStatus('PRESENT')
        setBulkNote('')
    }

    // 출석 상태 저장
    const handleSaveAttendance = async () => {
        const {cellInfo} = editModal
        if (!cellInfo) return

        // 기존 데이터와 비교하여 변경사항이 없으면 스킵
        const currentStatus = cellInfo.attendance?.status || 'None'
        const currentNote = cellInfo.attendance?.description || cellInfo.attendance?.note || ''

        if (cellInfo.attendance?.id && currentStatus === selectedStatus && currentNote === note) {
            console.log('동일한 출석 데이터로 업데이트를 스킵합니다.')
            return
        }

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

    // 일괄 편집 핸들러
    const handleBulkEdit = (selectedCells) => {
        setBulkEditModal({isOpen: true, selectedCells})
        setBulkStatus('PRESENT')
        setBulkNote('')
    }

    // 일괄 출석 상태 저장
    const handleSaveBulkAttendance = async () => {
        const {selectedCells} = bulkEditModal
        if (!selectedCells || selectedCells.length === 0) return

        setCellUpdateLoading(true)
        try {
            // 변경이 필요한 셀들만 필터링
            const cellsToUpdate = selectedCells.filter(cellInfo => {
                if (cellInfo.attendance?.id) {
                    // 기존 출석 데이터와 비교
                    const currentStatus = cellInfo.attendance.status || 'None'
                    const currentNote = cellInfo.attendance.description || cellInfo.attendance.note || ''
                    return currentStatus !== bulkStatus || currentNote !== bulkNote
                } else {
                    return true;
                }
            })

            if (cellsToUpdate.length === 0) {
                console.log('변경사항이 없는 일괄 업데이트를 스킵합니다.')
                setIsMultiSelectMode(false)
                return
            }

            // 변경이 필요한 셀들에 대해서만 업데이트
            const updatePromises = cellsToUpdate.map(async (cellInfo) => {
                if (cellInfo.attendance?.id) {
                    // 기존 출석 수정
                    return updateAttendance(cellInfo.attendance.id, {
                        status: bulkStatus,
                        detail_type: bulkStatus,
                        description: bulkNote
                    })
                } else {
                    // 새 출석 생성
                    return createAttendance(cellInfo.lectureId, {
                        user_id: cellInfo.userId,
                        status: bulkStatus,
                        detail_type: bulkStatus,
                        description: bulkNote
                    })
                }
            })

            await Promise.all(updatePromises)
            console.log(`일괄 업데이트 완료: ${cellsToUpdate.length}/${selectedCells.length}개 셀 업데이트됨`)
            await loadAttendances()
            // 일괄 저장 후 다중 선택 모드 종료 및 선택 해제
            setIsMultiSelectMode(false)
        } catch (err) {
            console.error('일괄 출석 정보 업데이트 실패:', err)
            onError('일괄 출석 정보 업데이트에 실패했습니다')
        } finally {
            setCellUpdateLoading(false)
        }
    }

    return (<div className="bg-white rounded-lg shadow ">

            {/* 출석부 테이블 */}
            <AttendanceTable
                attendances={attendances}
                lectures={lectures}
                enrolls={activeEnrolls}
                onCellClick={handleCellClick}
                onBulkEdit={handleBulkEdit}
                isMultiSelectMode={isMultiSelectMode}
                onMultiSelectModeChange={setIsMultiSelectMode}
                loading={(loading && attendancesLoading) || enrollsLoading}
                cellUpdateLoading={cellUpdateLoading}
                className="min-h-[500px]"
            />

            {/* 출석 상태 편집 모달 */}
            <AttendanceEditModal
                isOpen={editModal.isOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveAttendance}
                cellInfo={editModal.cellInfo}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                note={note}
                setNote={setNote}
                loading={cellUpdateLoading}
            />

            {/* 일괄 출석 상태 편집 모달 */}
            <BulkAttendanceEditModal
                isOpen={bulkEditModal.isOpen}
                onClose={handleCloseBulkModal}
                onSubmit={handleSaveBulkAttendance}
                selectedCells={bulkEditModal.selectedCells}
                bulkStatus={bulkStatus}
                setBulkStatus={setBulkStatus}
                bulkNote={bulkNote}
                setBulkNote={setBulkNote}
                loading={cellUpdateLoading}
            />
        </div>
    )
}

export default AttendanceTab