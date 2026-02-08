import DataTable from '../widgets/DataTable'
import SessionStatusBadge from "../SessionStatusBadge.jsx";

const LectureTable = ({
                          lectures,
                          loading,
                          onEditLecture,
                          onDeleteLecture
                      }) => {
    const lectureColumns = [
        {
            key: 'sequence',
            label: '회차',
            sortable: true,
            render: (value, row) => `${value || row.id}강`
        },
        {
            key: 'title',
            label: '강의명',
            sortable: true,
            render: (value, row) => (
                <div
                    className="font-medium text-gray-900 underline cursor-pointer hover:text-blue-600"
                    onClick={() => onEditLecture && onEditLecture(row)}
                    //  todo: 라우팅으로 수정
                >
                    {value || `${row.sequence || row.id}강`}
                </div>
            )
        },
        {
            key: 'lecture_date',
            label: '강의 일시',
            sortable: true,
            render: (value) => {
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
            default: '-'
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
            render: (value, row) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onEditLecture && onEditLecture(row)}
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
        />
    )
}

export default LectureTable