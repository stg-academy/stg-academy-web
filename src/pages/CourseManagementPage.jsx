import {useLocation, Link, Outlet} from 'react-router-dom'

const CourseManagementPage = () => {
    const location = useLocation()

    // 현재 경로에 따른 활성 탭 결정
    const activeTab = location.pathname === '/courses/sessions' ? 'sessions' : 'courses'

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">코스 관리</h2>
                </div>

                {/* 탭 네비게이션 */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <Link
                                to="/courses"
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'courses'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                코스 목록
                            </Link>
                            <Link
                                to="/courses/sessions"
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'sessions'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                강좌 목록
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* 현재 경로에 맞는 컴포넌트 렌더링 */}
                <Outlet />
            </main>
        </div>
    )
}

export default CourseManagementPage
