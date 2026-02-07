import DataTable from '../widgets/DataTable'

const SessionTable = ({
    sessions,
    loading,
    onEditSession
}) => {
    const sessionColumns = [
        {
            key: 'title',
            label: '강의명',
            sortable: true,
            render: (value, row) => (
                <div
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => onEditSession && onEditSession(row)}
                >
                    {value || `강좌 ${row.id?.slice(0, 8)}`}
                </div>
            )
        },
        {
            key: 'course_name',
            label: '코스',
            sortable: true,
            render: (value) => (
                <div className="text-sm text-gray-600">{value || '-'}</div>
            )
        },
        {
            key: 'description',
            label: '설명',
            sortable: false,
            default: '-'
        },
        {
            key: 'lecturer_info',
            label: '주강사',
            sortable: true,
            render: (value) => (
                <span className="text-sm text-gray-700">{value || '-'}</span>
            )
        },
        {
            key: 'date_info',
            label: '강의 일시',
            sortable: true,
            render: (value) => (
                <span className="text-sm text-gray-700">{value || '-'}</span>
            )
        },
        {
            key: 'begin_date',
            label: '수강 기간',
            sortable: true,
            render: (value, row) => {
                const start = value ? new Date(value).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }) : '-'
                const end = row.end_date ? new Date(row.end_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }) : '-'
                return (
                    <span className="text-sm text-gray-700">
                        {start} ~ {end}
                    </span>
                )
            }
        },
        {
            key: 'total_lectures',
            label: '총 회차',
            sortable: true,
            default: 0
        },
        {
            key: 'attendance_rate',
            label: '출석률',
            sortable: true,
            render: (value) => (
                <span className="text-sm font-medium text-gray-900">{value || 0}%</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => {
                let bgColor = 'bg-gray-100'
                let textColor = 'text-gray-800'
                let label = value || '대기'

                if (value === '진행중' || value === 'active') {
                    bgColor = 'bg-blue-100'
                    textColor = 'text-blue-800'
                    label = '진행중'
                } else if (value === '완료' || value === 'completed') {
                    bgColor = 'bg-green-100'
                    textColor = 'text-green-800'
                    label = '완료'
                }

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
                        {label}
                    </span>
                )
            }
        },
    ]

    return (
        <DataTable
            data={sessions}
            columns={sessionColumns}
            searchableColumns={['title', 'course_name', 'lecturer_info']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 세션이 없습니다."
            className="min-h-[500px]"
        />
    )
}

export default SessionTable