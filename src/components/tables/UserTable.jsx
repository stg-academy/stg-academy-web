import DataTable from '../ui/DataTable.jsx'

const UserTable = ({
    users,
    loading,
    // 인라인 편집 관련 props
    editingUserId,
    editingData,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onEditChange,
    // 유효성 검사 관련 props
    validationErrors
}) => {
    // 인증 유형 렌더링 함수
    const renderAuthType = (value) => {
        const authTypeConfig = {
            'kakao': { label: '카카오', className: 'bg-yellow-100 text-yellow-800' },
            'normal': { label: '일반', className: 'bg-gray-100 text-gray-800' },
            'manual': { label: '관리자 수기 등록', className: 'bg-blue-100 text-blue-800' },
        }
        const config = authTypeConfig[value] || { label: value || '-', className: 'bg-gray-100 text-gray-800' }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 사용자 상태 렌더링 함수 (is_active 기반)
    const renderUserStatus = (value) => {
        const statusConfig = {
            true: { label: '활성', className: 'bg-green-100 text-green-800' },
            false: { label: '비활성', className: 'bg-gray-100 text-gray-800' }
        }
        const config = statusConfig[value] || { label: value ? '활성' : '비활성', className: 'bg-gray-100 text-gray-800' }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 권한 렌더링 함수
    const renderRole = (value, row) => {
        const role = row.authorizations?.role || 'user'
        const roleConfig = {
            'admin': { label: '관리자', className: 'bg-purple-100 text-purple-800' },
            'user': { label: '사용자', className: 'bg-blue-100 text-blue-800' }
        }
        const config = roleConfig[role] || { label: role, className: 'bg-gray-100 text-gray-800' }
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        )
    }

    // 액션 버튼 렌더링 함수
    const renderActions = (value, row, isEditing) => {
        if (isEditing) {
            return (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onCancelEdit && onCancelEdit()}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        title="취소"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => onSaveEdit && onSaveEdit(row.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                        title="저장"
                    >
                        저장
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
                    편집
                </button>
            </div>
        )
    }

    // 사용자 테이블 컬럼 정의
    const userColumns = [
        {
            key: 'username',
            label: '사용자명',
            sortable: true,
            editable: true,
            editType: 'text',
            required: true,
            autoFocus: true
        },
        {
            key: 'information',
            label: '소속정보',
            sortable: true,
            editable: true,
            editType: 'text',
            default: '-'
        },
        {
            key: 'auth_type',
            label: '인증 유형',
            sortable: true,
            render: renderAuthType
        },
        {
            key: 'role',
            label: '권한',
            sortable: true,
            render: renderRole
        },
        {
            key: 'is_active',
            label: '상태',
            sortable: true,
            editable: true,
            editType: 'select',
            options: [
                { value: true, label: '활성' },
                { value: false, label: '비활성' }
            ],
            render: renderUserStatus
        },
        {
            key: 'last_login',
            label: '최근 로그인',
            sortable: true,
            render: (value) => {
                if (!value) return '로그인 기록 없음'
                return new Date(value).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        },
        {
            key: 'created_at',
            label: '가입일',
            sortable: true,
            render: (value) => {
                if (!value) return '-'
                return new Date(value).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }
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
            data={users}
            columns={userColumns}
            searchableColumns={['username', 'information', 'auth_type']}
            loading={loading}
            showPagination={false}
            showSearch={true}
            emptyMessage="등록된 사용자가 없습니다."
            // 인라인 편집 관련 props
            editingRowId={editingUserId}
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

export default UserTable