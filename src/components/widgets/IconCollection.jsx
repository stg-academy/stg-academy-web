import { useState } from 'react'
import Icon from '../ui/Icon.jsx'

// v2 Icon 컴포넌트(src/components/ui/Icon.jsx)의 40개 표준 아이콘 중
// 기존 "아이콘 모음집"이 다루던 카테고리와 겹치는 것만 선별해 재구성.
// 대응 아이콘이 없던 되돌리기/파일/첨부는 통합 과정에서 제외됨.
const iconCategories = [
    {
        category: '편집 관련',
        icons: [
            { name: '수정', iconName: 'edit' },
            { name: '저장', iconName: 'check' },
            { name: '취소', iconName: 'x' },
            { name: '삭제', iconName: 'trash' },
        ]
    },
    {
        category: '파일 관련',
        icons: [
            { name: '폴더', iconName: 'folder' },
            { name: '다운로드', iconName: 'download' },
            { name: '업로드', iconName: 'upload' },
        ]
    },
    {
        category: '날짜/시간',
        icons: [
            { name: '달력', iconName: 'calendar' },
            { name: '시계', iconName: 'clock' },
            { name: '알람', iconName: 'bell' },
        ]
    },
    {
        category: '화살표',
        icons: [
            { name: '위쪽', iconName: 'chevron-up' },
            { name: '아래쪽', iconName: 'chevron-down' },
            { name: '왼쪽', iconName: 'chevron-left' },
            { name: '오른쪽', iconName: 'chevron-right' },
            { name: '새로고침', iconName: 'refresh-cw' },
        ]
    },
    {
        category: '기타',
        icons: [
            { name: '검색', iconName: 'search' },
            { name: '설정', iconName: 'settings' },
            { name: '플러스', iconName: 'plus' },
            { name: '사용자', iconName: 'user' },
            { name: '정보', iconName: 'info' },
        ]
    }
]

const IconCollection = ({ title = "아이콘 모음집", className = "" }) => {
    const [copiedIcon, setCopiedIcon] = useState(null)

    // 클립보드에 <Icon name="..."/> 사용 코드 복사
    const copyToClipboard = async (icon) => {
        try {
            await navigator.clipboard.writeText(`<Icon name="${icon.iconName}" />`)
            setCopiedIcon(icon.name)
            setTimeout(() => setCopiedIcon(null), 2000)
        } catch (err) {
            console.error('복사 실패:', err)
        }
    }

    return (
        <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        아이콘을 클릭하면 사용 코드가 클립보드에 복사됩니다
                    </p>
                </div>
            </div>

            {/* 아이콘 그리드 */}
            <div className="p-6 space-y-8">
                {iconCategories.map((category) => (
                    <div key={category.category}>
                        <h4 className="text-sm font-medium text-neutral-800 mb-4 border-b border-neutral-100 pb-2">
                            {category.category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {category.icons.map((icon) => (
                                <div
                                    key={icon.iconName}
                                    className="relative group cursor-pointer"
                                    onClick={() => copyToClipboard(icon)}
                                >
                                    <div className="flex flex-col items-center p-4 rounded-md border border-neutral-200 hover:border-accent/40 hover:bg-accent-soft transition-all duration-200">
                                        <div className="text-neutral-600 group-hover:text-accent transition-colors">
                                            <Icon name={icon.iconName} size={20} />
                                        </div>
                                        <span className="text-xs text-neutral-500 mt-2 text-center group-hover:text-accent transition-colors">
                                            {icon.name}
                                        </span>

                                        {/* 복사 성공 표시 */}
                                        {copiedIcon === icon.name && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-success-soft border border-success/30 rounded-md">
                                                <div className="flex items-center space-x-1 text-success-text">
                                                    <Icon name="check" size={16} />
                                                    <span className="text-xs font-medium">복사됨</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 사용법 안내 */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
                <div className="flex items-center space-x-1">
                    <Icon name="info" size={16} />
                    <span>아이콘을 클릭하면 &lt;Icon name="..." /&gt; 코드가 자동으로 복사됩니다</span>
                </div>
            </div>
        </div>
    )
}

export default IconCollection
