import DataTable from '../ui/DataTable.jsx'
import {useNavigate} from 'react-router-dom'
import SessionStatusBadge from "../SessionStatusBadge.jsx";

const SessionTable = ({
                          sessions,
                          loading,
                          onEditSession
                      }) => {
    const navigate = useNavigate()
    const sessionColumns = [
        {
            key: 'title',
            label: '강의명',
            sortable: true,
            render: (value, row) => (
                <div
                    className="font-medium text-gray-900 underline cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/sessions/${row.id}`)}
                    // todo: onClick={() => onEditSession && onEditSession(row)}
                >
                    {value || `강좌 ${row.id?.slice(0, 8)}`}
                </div>
            )
        },
        {
            key: 'course_name',
            label: '코스',
            sortable: true,
            default: '-',
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
            default: '-'

        },
        {
            key: 'date_info',
            label: '강의 일시',
            sortable: true,
            default: '-'
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
            key: 'lecture_count',
            label: '총 회차',
            sortable: true,
            default: 0
        },
        {
            key: 'course_status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <SessionStatusBadge status={value}/>
            )
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
            emptyMessage="등록된 강좌이 없습니다."
        />
    )
}

export default SessionTable