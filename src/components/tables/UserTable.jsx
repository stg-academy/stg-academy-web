import DataTable from '../ui/DataTable.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { ROLES, getRoleDisplayName } from '../../utils/roleUtils.js'

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
            'kakao': { label: '카카오', tone: 'warning' },
            'normal': { label: '일반', tone: 'neutral' },
            'manual': { label: '관리자 수기 등록', tone: 'info' },
        }
        const config = authTypeConfig[value] || { label: value || '-', tone: 'neutral' }
        return <Badge tone={config.tone}>{config.label}</Badge>
    }

    // 사용자 상태 렌더링 함수 (is_active 기반)
    const renderUserStatus = (value) => {
        const statusConfig = {
            true: { label: '활성', tone: 'success' },
            false: { label: '비활성', tone: 'neutral' }
        }
        const config = statusConfig[value] || { label: value ? '활성' : '비활성', tone: 'neutral' }
        return <Badge tone={config.tone}>{config.label}</Badge>
    }

    // 권한 렌더링 함수
    const renderRole = (value, row) => {
        const role = row.authorizations?.role || ROLES.USER
        const roleConfig = {
            [ROLES.ADMIN]: { label: getRoleDisplayName(ROLES.ADMIN), tone: 'info' },
            [ROLES.USER]: { label: getRoleDisplayName(ROLES.USER), tone: 'neutral' }
        }
        const config = roleConfig[role] || { label: getRoleDisplayName(role), tone: 'neutral' }
        return <Badge tone={config.tone}>{config.label}</Badge>
    }

    // 액션 버튼 렌더링 함수
    const renderActions = (value, row, isEditing) => {
        if (isEditing) {
            return (
                <div className="flex items-center space-x-3">
                    <Button variant="link" size="sm" onClick={() => onCancelEdit && onCancelEdit()} title="취소">
                        취소
                    </Button>
                    <Button variant="link" size="sm" onClick={() => onSaveEdit && onSaveEdit(row.id)} title="저장">
                        저장
                    </Button>
                </div>
            )
        }
        return (
            <div className="flex items-center space-x-2">
                <Button variant="link" size="sm" onClick={() => onStartEdit && onStartEdit(row)}>
                    편집
                </Button>
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
            editable: true,
            editType: 'select',
            options: [
                { value: ROLES.USER, label: getRoleDisplayName(ROLES.USER) },
                { value: ROLES.ADMIN, label: getRoleDisplayName(ROLES.ADMIN) }
            ],
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