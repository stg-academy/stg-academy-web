import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import {createAttendance, getAttendancesBySession, updateAttendance} from '../services/attendanceService'
import {getAttendanceOptions} from '../utils/attendanceStatus'
import AttendanceTable from '../components/tables/AttendanceTable'

const AttendanceTab = ({
                           session,
                           lectures,
                           onError
                       }) => {
    const {user} = useAuth()

    const [attendances, setAttendances] = useState([])
    const [attendancesLoading, setAttendancesLoading] = useState(false)
    const [cellUpdateLoading, setCellUpdateLoading] = useState(false)
    const [editModal, setEditModal] = useState({isOpen: false, cellInfo: null})


    // 출석 목록 로드
    useEffect(() => {
        loadAttendances()
    }, [session])

    const loadAttendances = async () => {
        try {
            setAttendancesLoading(true)
            console.log(session)
            const data = await getAttendancesBySession(session.id)
            setAttendances(data)
            console.log(data)
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
    }

    // 모달 닫기
    const handleCloseModal = () => {
        setEditModal({isOpen: false, cellInfo: null})
    }

    // 출석 상태 저장
    const handleSaveAttendance = async (status, note = '') => {
        const {cellInfo} = editModal
        if (!cellInfo) return

        setCellUpdateLoading(true)
        try {
            if (cellInfo.attendance?.id) {
                // 기존 출석 수정
                await updateAttendance(cellInfo.attendance.id, {
                    status: status,
                    note: note
                })
            } else {
                // 새 출석 생성
                await createAttendance(cellInfo.lectureId, {
                    user_id: cellInfo.userId,
                    status: status,
                    note: note
                })
            }
            await loadAttendances()
        } catch (err) {
            console.error('출석 정보 업데이트 실패:', err)
            onError('출석 정보 업데이트에 실패했습니다')
        } finally {
            setCellUpdateLoading(false)
            handleCloseModal()
        }
    }

    return (<div className="bg-white rounded-lg shadow ">

            {/* 출석부 테이블 */}
            <AttendanceTable
                attendances={attendances}
                lectures={lectures}
                onCellClick={handleCellClick}
                loading={attendancesLoading}
                cellUpdateLoading={cellUpdateLoading}
                className="min-h-[500px]"
            />

            {/* 출석 상태 편집 모달 */}
            {editModal.isOpen && (
                <AttendanceEditModal
                    isOpen={editModal.isOpen}
                    onClose={handleCloseModal}
                    cellInfo={editModal.cellInfo}
                    onSave={handleSaveAttendance}
                />
            )}
        </div>
    )
}

// 출석 상태 편집 모달
const AttendanceEditModal = ({isOpen, onClose, cellInfo, onSave}) => {
    const [selectedStatus, setSelectedStatus] = useState(cellInfo?.attendance?.status || 'PRESENT')
    const [note, setNote] = useState(cellInfo?.attendance?.note || '')

    const options = getAttendanceOptions()

    const handleSave = () => {
        onSave(selectedStatus, note)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    출석 상태 편집
                                </h3>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        <strong>{cellInfo?.userName}</strong> - {cellInfo?.lectureTitle}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        출석 상태
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {options.map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => setSelectedStatus(option.value)}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                                                    selectedStatus === option.value
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        비고
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="추가 메모를 입력하세요..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            onClick={handleSave}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            저장
                        </button>
                        <button
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttendanceTab