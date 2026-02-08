import Modal from '../ui/Modal'
import SelectInput from '../forms/SelectInput'
import TextareaInput from '../forms/TextareaInput'
import {getAttendanceOptions} from '../../utils/attendanceStatus'

/**
 * 일괄 출석 상태 편집 모달 컴포넌트
 */
const BulkAttendanceEditModal = ({
                                     isOpen,
                                     onClose,
                                     onSubmit,
                                     selectedCells = [],
                                     bulkStatus,
                                     setBulkStatus,
                                     bulkNote,
                                     setBulkNote,
                                     loading = false
                                 }) => {
    const attendanceOptions = getAttendanceOptions()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="일괄 출석 상태 편집"
            onSubmit={onSubmit}
            disabled={loading}
            submitText="일괄 저장"
            loadingText="저장 중..."
        >
            <div className="space-y-4">
                {/* 선택된 항목 정보 */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        선택된 출석 항목: {selectedCells.length}개
                    </h4>
                    <div className="text-xs text-blue-700 max-h-32 overflow-y-auto">
                        {selectedCells.map((cell, index) => (
                            <div key={index} className="mb-1">
                                {cell.userName} - {cell.lectureTitle}
                            </div>
                        ))}
                    </div>
                </div>

                <SelectInput
                    id="bulk-attendance-status"
                    name="bulkAttendanceStatus"
                    label="출석 상태"
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    options={attendanceOptions}
                    required
                />

                <TextareaInput
                    id="bulk-attendance-note"
                    name="bulkAttendanceNote"
                    label="비고"
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    placeholder="일괄 적용할 메모를 입력하세요..."
                    rows={3}
                    description="이 비고는 선택된 모든 출석 항목에 동일하게 적용됩니다."
                />
            </div>
        </Modal>
    )
}

export default BulkAttendanceEditModal