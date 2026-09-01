import DataTable from '../ui/DataTable.jsx'
import Icon from '../ui/Icon.jsx'
import {useNavigate} from 'react-router-dom'
import {renderTruncatedCell} from '../../utils/renderUtils.jsx'

const CourseTable = ({
                         courses,
                         loading,
                         onEditCourse
                     }) => {
    const navigate = useNavigate()

    // 강좌수 클릭 핸들러
    const handleLectureCountClick = (course) => {
        navigate(`/courses/sessions?course_id=${course.id}`)
    }

    const courseColumns = [
        {
            key: 'title', label: '코스명', sortable: true,
            render: (value, row) => (
                <div
                    className="font-medium text-gray-900 underline cursor-pointer hover:text-blue-600"
                    onClick={() => onEditCourse(row)}
                >{value}</div>
            )
        },
        {
            key: 'description', label: '설명', sortable: true, default: '-',
            render: (value) => renderTruncatedCell(value)
        },
        {
            key: 'author',
            label: '작성자', sortable: true, default: '-'
        },
        {
            key: 'lecture_count',
            label: '강좌 수',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{value || 0}</span>
                    <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleLectureCountClick(row)}
                        title="강좌 목록 보기"
                    >
                        <Icon name="edit" size={16} />
                    </button>
                </div>
            )
        }
    ]

    // 모바일 카드 리스트 렌더링 함수
    const renderMobileItem = (row) => (
        <div className="px-5 py-4 flex flex-col gap-2">
            <div
                className="text-sm font-semibold text-neutral-900 underline cursor-pointer"
                onClick={() => onEditCourse(row)}
            >
                {row.title}
            </div>
            {row.description && (
                <div className="text-xs text-neutral-500">{renderTruncatedCell(row.description)}</div>
            )}
            <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>작성자 {row.author || '-'}</span>
                <button
                    type="button"
                    className="flex items-center gap-1 text-accent font-medium"
                    onClick={() => handleLectureCountClick(row)}
                >
                    강좌 {row.lecture_count || 0}개
                    <Icon name="chevron-right" size={14} />
                </button>
            </div>
        </div>
    )

    const courseFooter = (
        <>
            <p>* 코스 생성 및 관리는 이곳에서 진행하세요. 코스명을 클릭하여 편집할 수 있습니다.</p>
            <p>* 강좌 수를 클릭하면 해당 코스의 강좌 목록을 확인할 수 있습니다.</p>
        </>
    )

    return (
        <DataTable
            data={courses}
            columns={courseColumns}
            searchableColumns={['name', 'description', 'author']}
            loading={loading}
            itemsPerPage={10}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 코스가 없습니다."
            footer={courseFooter}
            renderMobileItem={renderMobileItem}
        />
    )
}

export default CourseTable