import Modal from '../ui/Modal'
import SelectInput from '../forms/SelectInput'
import TextareaInput from '../forms/TextareaInput'
import {getAttendanceOptions} from '../../utils/attendanceStatus'

/**
 * 개별 출석 상태 편집 모달 컴포넌트
 */
const AttendanceEditModal = ({
    isOpen,
    onClose,
    onSubmit,
    cellInfo,
    selectedStatus,
    setSelectedStatus,
    note,
    setNote,
    loading = false
}) => {
    const attendanceOptions = getAttendanceOptions()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="출석 상태 편집"
            onSubmit={onSubmit}
            disabled={loading}
            submitText="저장"
            loadingText="저장 중..."
        >
            <div className="space-y-4">
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        <strong>{cellInfo?.userName}</strong> - {cellInfo?.lectureTitle}
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
    )
}

export default AttendanceEditModal