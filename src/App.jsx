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
import UserManagementPage from "./pages/UserManagementPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import CompleteKakaoRegistration from "./pages/CompleteKakaoRegistration.jsx";
import DesignGuidePage from "./pages/DesignGuidePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MyLearning from "./pages-mobile/MyLearning.jsx";
import Home from "./pages-mobile/Home.jsx";
import Attendance from "./pages-mobile/Attendance.jsx";
import SessionDetail from "./pages-mobile/SessionDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages-mobile/Search.jsx";
import KioskAttendance from "./pages/KioskAttendance.jsx";

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
                // 인증 관련 라우트
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/auth/complete-registration" element={<CompleteKakaoRegistration/>}/>

                // 모든 사용자에게 공개된 라우트
                <Route path="/" element={<Home/>}/>
                <Route path="/sample" element={<SamplePage/>}/>
                <Route path="/design-guide" element={<DesignGuidePage/>}/>
                <Route path="/profile" element={<Profile />}/>

                // 모바일
                <Route path="mobile/home" element={<Home />}/>
                <Route path="mobile/my-learning" element={<MyLearning />}/>
                <Route path="mobile/attendance" element={<Attendance />}/>
                <Route path="mobile/session/:sessionId" element={<SessionDetail />}/>
                <Route path="mobile/search" element={<Search />}/>

                // 키오스크
                <Route path="/sessions/:session_id/attendance/kiosk" element={<KioskAttendance />}/>

                // 관리자 전용 라우트
                <Route path="/courses" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <CourseManagementPage/>
                    </ProtectedRoute>
                }>
                    <Route index element={
                        <ProtectedRoute requiredRole="ADMIN">
                            <CourseListPage/>
                        </ProtectedRoute>
                    }/>
                    <Route path="sessions" element={
                        <ProtectedRoute requiredRole="ADMIN">
                            <SessionListPage/>
                        </ProtectedRoute>
                    }/>
                </Route>
                <Route path="/sessions/:sessionId" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <SessionDetailPage/>
                    </ProtectedRoute>
                }/>
                <Route path="/lectures/:lectureId/attendances" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <AttendanceTab/>
                    </ProtectedRoute>
                }/>
                <Route path="/users" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <UserManagementPage/>
                    </ProtectedRoute>
                }/>
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