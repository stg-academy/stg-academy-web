import DataTable from '../ui/DataTable.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import { ROLES, getRoleDisplayName } from '../../utils/roleUtils.js'

const UserTable = ({
    users,
    loading,
    // 서버사이드 페이지네이션 (검색 중에는 false로 전달되어 검색 결과 내에서 클라이언트 페이지네이션됨)
    serverPagination = true,
    totalCount,
    currentPage,
    onPageChange,
    // 검색 (서버사이드, 전체 사용자 대상 — UserManagementPage에서 제어)
    searchValue,
    onSearchChange,
    // 인라인 편집 관련 props
    editingUserId,
    editingData,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onEditChange,
    // 유효성 검사 관련 props
    validationErrors,
    // 비밀번호 초기화 (일반 로그인 계정만 가능)
    onResetPassword
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="!px-2"
                        onClick={() => onCancelEdit && onCancelEdit()}
                        title="취소"
                        aria-label="취소"
                    >
                        <Icon name="x" size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="!px-2"
                        onClick={() => onSaveEdit && onSaveEdit(row.id)}
                        title="저장"
                        aria-label="저장"
                    >
                        <Icon name="check" size={16} />
                    </Button>
                </div>
            )
        }
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="!px-2"
                    onClick={() => onStartEdit && onStartEdit(row)}
                    title="편집"
                    aria-label="편집"
                >
                    <Icon name="edit" size={16} />
                </Button>
                {row.auth_type === 'normal' && (
                    <Button variant="secondary" size="sm" onClick={() => onResetPassword && onResetPassword(row)}>
                        비밀번호 초기화
                    </Button>
                )}
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
            key: 'phone_number',
            label: '전화번호',
            sortable: true,
            editable: true,
            editType: 'text',
            default: '-'
        },
        {
            key: 'auth_type',
            label: '인증 유형',
            sortable: true,
            render: renderAuthType,
            mobileInfo: true
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
            },
            mobileInfo: true
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
            },
            mobileInfo: true
        },
        {
            key: 'actions',
            label: '작업',
            sortable: false,
            render: renderActions
        }
    ]

    // 모바일 카드 리스트 렌더링 함수
    const renderMobileItem = (row) => {
        const role = row.authorizations?.role || ROLES.USER
        const initial = (row.username || '?').charAt(0).toUpperCase()
        return (
            <button
                type="button"
                onClick={() => onStartEdit && onStartEdit(row)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-neutral-50 transition-colors"
            >
                <div className="flex-none w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-sm font-semibold">
                    {initial}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900">{row.username}</span>
                        {renderRole(role, row)}
                        {renderUserStatus(row.is_active)}
                    </div>
                    <div className="text-xs text-neutral-500 truncate">
                        {row.information || '-'} · {row.auth_type === 'kakao' ? '카카오' : row.auth_type === 'manual' ? '관리자 수기 등록' : '일반'}
                    </div>
                </div>
                <Icon name="chevron-right" size={16} className="flex-none text-neutral-400" />
            </button>
        )
    }

    return (
        <DataTable
            data={users}
            columns={userColumns}
            loading={loading}
            itemsPerPage={30}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 사용자가 없습니다."
            // 검색창은 DataTable 내장 UI를 그대로 쓰되, searchValue/onSearchChange를 넘겨
            // UserManagementPage의 서버 검색(전체 사용자 대상)으로 제어한다
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            // 서버사이드 페이지네이션 (검색 중에는 false — 검색 결과 내에서 클라이언트 페이지네이션)
            serverPagination={serverPagination}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={onPageChange}
            renderMobileItem={renderMobileItem}
            // 모바일 편집 시트: 가입일 정보 아래에 비밀번호 초기화 버튼 (일반 로그인 계정만)
            renderMobileEditExtra={(row) => row.auth_type === 'normal' ? (
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                        onCancelEdit && onCancelEdit()
                        onResetPassword && onResetPassword(row)
                    }}
                >
                    비밀번호 초기화
                </Button>
            ) : null}
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