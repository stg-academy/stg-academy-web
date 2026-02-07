import DataTable from '../widgets/DataTable'

const SessionTable = ({
    sessions,
    loading,
    onSessionCountClick
}) => {
    const lectureColumns = [
        {
            key: 'title',
            label: '강좌명',
            sortable: true,
            render: (value) => (
                <div className="font-medium text-gray-900">{value}</div>
            )
        },
        {
            key: 'course',
            label: '코스',
            sortable: true,
            render: (value) => (
                <div className="text-sm text-gray-600">{value}</div>
            )
        },
        {
            key: 'author',
            label: '작성자',
            sortable: true,
            render: (value) => (
                <span className="text-sm text-gray-700">{value}</span>
            )
        },
        {
            key: 'sessionCount',
            label: '세션 수',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                    <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => onSessionCountClick && onSessionCountClick(row)}
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
            data={sessions}
            columns={lectureColumns}
            searchableColumns={['title', 'course', 'author']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 강좌가 없습니다."
            className="min-h-[500px]"
        />
    )
}

export default SessionTable