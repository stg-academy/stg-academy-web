import DataTable from '../ui/DataTable.jsx'
import Icon from '../ui/Icon.jsx'
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
                    <Icon name="copy" size={20} />
                </button>
            )
        },
    ]

    // 모바일 카드 리스트 렌더링 함수
    const renderMobileItem = (row) => {
        const start = row.begin_date ? new Date(row.begin_date).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        }) : '-'
        const end = row.end_date ? new Date(row.end_date).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        }) : '-'
        return (
            <div className="px-5 py-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div
                        className="text-sm font-semibold text-neutral-900 underline cursor-pointer"
                        onClick={() => navigate(`/sessions/${row.id}`)}
                    >
                        {row.title || `강좌 ${row.id?.slice(0, 8)}`}
                    </div>
                    <div className="flex-none flex items-center gap-2">
                        <SessionStatusBadge status={row.course_status}/>
                        <button
                            onClick={() => onCopySession && onCopySession(row)}
                            title="강좌 복사"
                            className="text-neutral-400 hover:text-accent"
                        >
                            <Icon name="copy" size={16} />
                        </button>
                    </div>
                </div>
                <div className="text-xs text-neutral-500">{row.course_name || '-'} · {row.lecturer_info || '-'}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-600">
                    <div>{row.date_info || '-'}</div>
                    <div>총 {row.lecture_count || 0}회차</div>
                    <div className="col-span-2">{start} ~ {end}</div>
                </div>
            </div>
        )
    }

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
            renderMobileItem={renderMobileItem}
        />
    )
}

export default SessionTable