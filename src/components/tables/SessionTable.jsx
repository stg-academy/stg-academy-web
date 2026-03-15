import DataTable from '../ui/DataTable.jsx'
import {useNavigate} from 'react-router-dom'
import SessionStatusBadge from "../SessionStatusBadge.jsx";

const SessionTable = ({
                          sessions,
                          loading,
                          onCopySession,
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
        {
            key: '_actions',
            label: '',
            sortable: false,
            render: (_, row) => (
                <button
                    onClick={() => onCopySession && onCopySession(row)}
                    title="강좌 복사"
                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                </button>
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