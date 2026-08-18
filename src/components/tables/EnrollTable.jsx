import DataTable from '../ui/DataTable.jsx'
import Button from '../ui/Button.jsx'

// 발급일 yy.mm.dd 포맷 (앱의 다른 곳에서 쓰는 4자리 연도 포맷과는 별개)
const formatShortDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    const yy = String(date.getFullYear()).slice(-2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yy}.${mm}.${dd}`
}

const EnrollTable = ({
                         enrolls,
                         loading,
                         onEditEnrollment,
                         onDeleteStudent,
                         certifications = [],
                         onIssueCertification,
                         onViewCertification
                     }) => {
    // 사용자ID → 수료증 매핑
    const certByUserId = {}
    certifications.forEach(cert => {
        certByUserId[cert.user_id] = cert
    })

    // 수료증 버튼 렌더링 함수 (발급됨 > ACTIVE 여부 순으로 판정)
    const renderCertificationButton = (row) => {
        const cert = certByUserId[row.user_id]
        if (cert) {
            return (
                <Button size="sm" onClick={() => onViewCertification && onViewCertification(row, cert)}>
                    수료증 조회({formatShortDate(cert.issued_at)} 발급)
                </Button>
            )
        }
        const isActive = row.enroll_status === 'ACTIVE'
        return (
            <Button
                size="sm"
                disabled={!isActive}
                onClick={() => onIssueCertification && onIssueCertification(row)}
            >
                수료증 발급
            </Button>
        )
    }
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
        },
        {
            key: 'certification',
            label: '수료증',
            sortable: false,
            render: (value, row) => renderCertificationButton(row)
        }
    ]

    // 모바일 카드 리스트 렌더링 함수
    const renderMobileItem = (row) => (
        <div className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
            <button
                type="button"
                onClick={() => onEditEnrollment && onEditEnrollment(row)}
                className="flex-1 min-w-0 flex flex-col gap-1 text-left"
            >
                <span className="text-sm font-semibold text-neutral-900 truncate">{row.user_name || '-'}</span>
                <div className="flex items-center gap-1.5">
                    {renderAuthType(row.auth_type, row)}
                    {renderStatus(row.enroll_status)}
                </div>
            </button>
            <div className="flex-none" onClick={(e) => e.stopPropagation()}>
                {renderCertificationButton(row)}
            </div>
        </div>
    )

    const enrollFooter = (
        <>
            <p>* 수강생 정보 관리는 이곳에서 진행하세요. 학생명을 클릭하여 수강 정보를 수정할 수 있습니다.</p>
            <p>* 수강 상태가 'ACTIVE'인 학생만 출석부에 표시됩니다.</p>
            <p>* 수료증은 한 번 발급되면 수강 상태가 바뀌어도 계속 조회할 수 있습니다.</p>
        </>
    )

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
            renderMobileItem={renderMobileItem}
        />
    )
}

export default EnrollTable