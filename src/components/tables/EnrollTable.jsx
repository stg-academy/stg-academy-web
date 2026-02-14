import DataTable from '../ui/DataTable.jsx'

const EnrollTable = ({
                         enrolls,
                         loading,
                         onEditEnrollment,
                         onDeleteStudent
                     }) => {
    // 수강 상태 렌더링 함수
    const renderStatus = (value) => {

        // todo: enrollStatusConfig enum으로 관리하는 게 좋을 듯
        const statusConfig = {
            'ACTIVE': {label: '활성', className: 'bg-green-100 text-green-800'},
            'INACTIVE': {label: '비활성', className: 'bg-gray-100 text-gray-800'},
            'DROPPED': {label: '중도포기', className: 'bg-red-100 text-red-800'}
        }
        const config = statusConfig[value] || {label: value || '-', className: 'bg-gray-100 text-gray-800'}
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 인증 유형 렌더링 함수
    const renderAuthType = (value, row) => {
        // todo: authTypeConfig enum으로 관리하는 게 좋을 듯
        const authTypeConfig = {
            'kakao': {label: '카카오', className: 'bg-yellow-100 text-yellow-800'},
            'normal': {label: '일반', className: 'bg-gray-100 text-gray-800'},
            'manual': {label: '관리자 수기 등록', className: 'bg-blue-100 text-blue-800'},
        }
        const config = authTypeConfig[value] || {label: value, className: 'bg-gray-100 text-gray-800'}
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 액션 버튼 렌더링 함수
    const renderActions = (value, row) => (
        <div className="flex items-center space-x-2">
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
            key: 'user_name',
            label: '학생명',
            sortable: true,
            default: '-',
            render: (value, row) => {
                return (
                    <button
                        onClick={() => onEditEnrollment && onEditEnrollment(row)}
                        className="font-medium text-gray-900 hover:text-blue-600 underline cursor-pointer"
                    >
                        {value}
                    </button>
                )
            }
        },
        {
            key: 'auth_type',
            label: '인증 유형',
            sortable: true,
            default: '-',
            render: renderAuthType
        },
        {
            key: 'enroll_status',
            label: '수강 상태',
            sortable: true,
            render: renderStatus
        }
    ]

    const enrollFooter = (
        <>
            <p>* 수강생 정보 관리는 이곳에서 진행하세요. 학생명을 클릭하여 수강 정보를 수정할 수 있습니다.</p>
            <p>* 수강 상태가 'ACTIVE'인 학생만 출석부에 표시됩니다.</p>
        </>
    )

    console.log(enrolls)
    return (
        <DataTable
            data={enrolls}
            columns={enrollColumns}
            searchableColumns={['user_name', 'auth_type', 'enroll_status']}
            loading={loading}
            showPagination={false}
            showSearch={true}
            emptyMessage="등록된 수강생이 없습니다."
            footer={enrollFooter}
        />
    )
}

export default EnrollTable