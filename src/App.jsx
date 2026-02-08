import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import {AuthProvider} from './contexts/AuthContext'
import Header from './components/Header'
import SampleDashboard from './pages/SampleDashboard'
import SamplePage from './pages/SamplePage'
import KakaoCallback from './components/KakaoCallback'
import CourseManagementPage from "./pages/CourseManagementPage.jsx"
import CourseListPage from './pages/CourseListPage'
import SessionListPage from './pages/SessionListPage.jsx'
import SessionDetailPage from "./pages/SessionDetailPage.jsx";
import AttendanceTab from "./pages/AttendanceTab.jsx";

function AppContent() {
    // 현재 URL이 카카오 콜백인지 확인
    const isKakaoCallback = window.location.pathname === '/auth/kakao/callback'

    // 카카오 콜백 페이지인 경우 헤더 없이 렌더링
    if (isKakaoCallback) {
        return <KakaoCallback/>
    }

    // 일반 앱 콘텐츠
    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <Routes>
                <Route path="/" element={<SampleDashboard/>}/>
                <Route path="/courses" element={<CourseManagementPage/>}>
                    <Route index element={<CourseListPage/>}/>
                    <Route path="sessions" element={<SessionListPage/>}/>
                </Route>
                <Route path="/sessions/:sessionId" element={<SessionDetailPage/>}/>
                <Route path="/lectures/:lectureId/attendances" element={<AttendanceTab/>}/>
                <Route path="/sample" element={<SamplePage/>}/>
            </Routes>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/auth/kakao/callback" element={<KakaoCallback/>}/>
                    <Route path="/*" element={<AppContent/>}/>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App