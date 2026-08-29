import DataTable from '../ui/DataTable.jsx'
import Button from '../ui/Button.jsx'
import {formatNameWithPhone} from '../../utils/phoneUtils.js'

const formatDate = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

const AssistantTable = ({
                             assistants,
                             loading,
                             onRemoveAssistant
                         }) => {
    // 조교 테이블 컬럼 정의
    const assistantColumns = [
        {
            key: 'username',
            label: '이름',
            sortable: true,
            default: '-',
            render: (value, row) => formatNameWithPhone(value, row.phone_number)
        },
        {
            key: 'created_at',
            label: '등록일',
            sortable: true,
            render: (value) => formatDate(value)
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            render: (value, row) => (
                <Button variant="link" size="sm" onClick={() => onRemoveAssistant && onRemoveAssistant(row)}>
                    해제
                </Button>
            )
        }
    ]

    // 모바일 카드 리스트 렌더링 함수
    const renderMobileItem = (row) => (
        <div className="w-full flex items-center gap-3 px-5 py-3.5">
            <div className="flex-none w-9 h-9 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-sm font-semibold">
                {(row.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-neutral-900 truncate">{formatNameWithPhone(row.username, row.phone_number) || '-'}</span>
                <span className="text-xs text-neutral-500">{formatDate(row.created_at)} 등록</span>
            </div>
            <button
                onClick={() => onRemoveAssistant && onRemoveAssistant(row)}
                className="flex-none text-sm font-medium text-accent"
            >
                해제
            </button>
        </div>
    )

    const assistantFooter = (
        <p>* 조교 등록/해제는 해당 사용자가 재로그인해야 반영됩니다.</p>
    )

    return (
        <DataTable
            data={assistants}
            columns={assistantColumns}
            searchableColumns={[]}
            loading={loading}
            itemsPerPage={30}
            showPagination={true}
            showSearch={false}
            emptyMessage="등록된 조교가 없습니다."
            footer={assistantFooter}
            renderMobileItem={renderMobileItem}
        />
    )
}

export default AssistantTable
