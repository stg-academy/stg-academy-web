import DataTable from '../widgets/DataTable'
import SessionStatusBadge from "../SessionStatusBadge.jsx";
import {useNavigate} from "react-router-dom";

const LectureTable = ({
                          lectures,
                          loading,
                          onDeleteLecture,
                          // 인라인 편집 관련 props
                          editingLectureId,
                          editingData,
                          onStartEdit,
                          onCancelEdit,
                          onSaveEdit,
                          onEditChange,
                          // 유효성 검사 관련 props
                          validationErrors
                      }) => {
    const navigate = useNavigate()
    const lectureColumns = [
        {
            key: 'sequence',
            label: '회차',
            sortable: true,
            render: (value, row) => `${value || row.id}강`
        },
        {
            key: 'title',
            label: (
                <span>
                    강의명
                </span>
            ),
            sortable: true,
            editable: true,
            editType: 'text',
            autoFocus: true,
            required: true,
            render: (value, row, isEditing) => {
                if (isEditing) return null // 편집 모드에서는 input으로 대체
                return (
                    <div className="font-medium text-gray-900 underline cursor-pointer hover:text-blue-600"
                         onClick={() => navigate(`/lectures/${row.id}/attendances`)}
                    >
                        {value || `${row.sequence || row.id}강`}
                    </div>
                )
            }
        },
        {
            key: 'lecture_date',
            label: (
                <span>
                    강의 일시
                </span>
            ),
            sortable: true,
            editable: true,
            editType: 'date',
            required: true,
            render: (value, row, isEditing) => {
                if (isEditing) return null // 편집 모드에서는 input으로 대체
                if (!value) return '-'
                return new Date(value).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    weekday: 'short'
                })
            }
        },
        {
            key: 'attendance_type',
            label: '출결방식',
            sortable: true,
            editable: true,
            editType: 'select',
            options: [
                { value: '전자출결', label: '전자출결' },
                { value: '수기출결', label: '수기출결' } //todo: enum 으로 관리
            ],
            default: '전자출결'
        },
        // {
        //     key: 'materials_count',
        //     label: '자료',
        //     sortable: true,
        //     render: (value) => `${value || 0}개`
        // }, // todo: 자료 구현
        {
            key: 'attendance_rate',
            label: '출석률',
            sortable: true,
            default: '-'
            // todo: 출석률 렌더링
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <SessionStatusBadge status={value}/>
            )
        },
        {
            key: 'actions',
            label: '작업',
            sortable: false,
            render: (value, row, isEditing) => {
                if (isEditing) {
                    return (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onCancelEdit && onCancelEdit()}
                                className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                                title="취소"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onSaveEdit && onSaveEdit(row.id)}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                title="저장"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    )
                }
                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onStartEdit && onStartEdit(row)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            수정
                        </button>
                        <button
                            onClick={() => onDeleteLecture && onDeleteLecture(row.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                            삭제
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <DataTable
            data={lectures}
            columns={lectureColumns}
            searchableColumns={['title', 'sequence', 'status']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 강의가 없습니다."
            className="min-h-[400px]"
            // 인라인 편집 관련 props
            editingRowId={editingLectureId}
            editingData={editingData}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onEditChange={onEditChange}
            // 유효성 검사 관련 props
            validationErrors={validationErrors}
        />
    )
}

export default LectureTable