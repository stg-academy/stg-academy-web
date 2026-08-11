import {useLocation, Outlet} from 'react-router-dom'
import PageContainer from '../components/ui/PageContainer.jsx'
import TabNav from '../components/ui/TabNav.jsx'

const CourseManagementPage = () => {
    const location = useLocation()

    // 현재 경로에 따른 활성 탭 결정
    const activeTab = location.pathname === '/courses/sessions' ? 'sessions' : 'courses'

    return (
        <PageContainer>
            {/* 페이지 헤더 */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900">강의 관리</h2>
            </div>

            {/* 탭 네비게이션 */}
            <div className="mb-6">
                <TabNav
                    tabs={[
                        {key: 'sessions', label: '강좌 목록', to: '/courses/sessions'},
                        {key: 'courses', label: '코스 목록', to: '/courses'},
                    ]}
                    active={activeTab}
                />
            </div>

            {/* 현재 경로에 맞는 컴포넌트 렌더링 */}
            <Outlet />
        </PageContainer>
    )
}

export default CourseManagementPage
