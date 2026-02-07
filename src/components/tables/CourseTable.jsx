import DataTable from '../widgets/DataTable'

const CourseTable = ({
    courses,
    loading,
    onEditCourse,
    onLectureCountClick
}) => {
    const courseColumns = [
        {
            key: 'title', label: '코스명', sortable: true,
            render: (value, row) => (
                <div
                    className="font-medium text-gray-900 underline cursor-pointer hover:text-blue-600"
                    onClick={() => onEditCourse(row)}
                >{value}</div>
            )
        },
        {key: 'description', label: '설명', sortable: true, default: '-'},
        {
            key: 'author', // todo: 작성자 api 필드 추가
            label: '작성자', sortable: true, default: '-'
        },
        {
            key: 'lecture_count', // todo: 강좌수 api 필드 추가
            label: '강좌 수',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{value || 0}</span>
                    <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => onLectureCountClick && onLectureCountClick(row)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                </div>
            )
        }
    ]

    return (
        <DataTable
            data={courses}
            columns={courseColumns}
            searchableColumns={['name', 'description', 'author']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 코스가 없습니다."
            className="min-h-[500px]"
        />
    )
}

export default CourseTable