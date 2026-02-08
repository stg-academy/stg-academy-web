import DataTable from '../ui/DataTable.jsx'

const EnrollTable = ({
    enrolls,
    loading,
    onEditStudent,
    onDeleteStudent
}) => {
    // 수강 상태 렌더링 함수
    const renderStatus = (value) => {
        const statusConfig = {
            'ACTIVE': { label: '활성', className: 'bg-green-100 text-green-800' },
            'INACTIVE': { label: '비활성', className: 'bg-gray-100 text-gray-800' },
            'COMPLETED': { label: '완료', className: 'bg-blue-100 text-blue-800' },
            'DROPPED': { label: '중도포기', className: 'bg-red-100 text-red-800' }
        }
        const config = statusConfig[value] || { label: value || '-', className: 'bg-gray-100 text-gray-800' }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 날짜 렌더링 함수
    const renderDate = (value) => {
        if (!value) return '-'
        return new Date(value).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    // 액션 버튼 렌더링 함수
    const renderActions = (value, row) => (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => onEditStudent && onEditStudent(row)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
                편집
            </button>
            <button
                onClick={() => onDeleteStudent && onDeleteStudent(row.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
                삭제
            </button>
        </div>
    )

    // 수강생 테이블 컬럼 정의
    const enrollColumns = [
        {
            key: 'user.name',
            label: '학생명',
            sortable: true,
            render: (value, row) => row.user?.name || row.user_name || '-'
        },
        {
            key: 'user.email',
            label: '이메일',
            sortable: true,
            render: (value, row) => row.user?.email || row.user_email || '-'
        },
        {
            key: 'user.phone',
            label: '연락처',
            sortable: true,
            render: (value, row) => row.user?.phone || row.user_phone || '-'
        },
        {
            key: 'user.class',
            label: '반',
            sortable: true,
            render: (value, row) => row.user?.class || row.user_class || '-'
        },
        {
            key: 'status',
            label: '수강 상태',
            sortable: true,
            render: renderStatus
        },
        {
            key: 'enrolled_at',
            label: '등록일',
            sortable: true,
            render: renderDate
        },
        {
            key: 'actions',
            label: '작업',
            sortable: false,
            render: renderActions
        }
    ]

    return (
        <DataTable
            data={enrolls}
            columns={enrollColumns}
            searchableColumns={['user.name', 'user.email', 'user.phone', 'user.class', 'status']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 수강생이 없습니다."
            className="min-h-[400px]"
        />
    )
}

export default EnrollTable