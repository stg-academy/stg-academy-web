import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom'
import {AuthProvider} from './contexts/AuthContext'
import {ToastProvider} from './components/ui/ToastProvider.jsx'
import Header from './components/Header'
import SampleDashboard from './pages/SampleDashboard'
import SamplePage from './pages/SamplePage'
import CourseManagementPage from "./pages/CourseManagementPage.jsx"
import CourseListPage from './pages/CourseListPage'
import SessionListPage from './pages/SessionListPage.jsx'
import SessionDetailPage from "./pages/SessionDetailPage.jsx";
import AttendanceTab from "./pages/AttendanceTab.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import AssistantSessionListPage from "./pages/AssistantSessionListPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DesignGuidePage from "./pages/DesignGuidePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PrivacyConsentGate from "./components/PrivacyConsentGate.jsx";
import MyLearning from "./pages-mobile/MyLearning.jsx";
import Home from "./pages-mobile/Home.jsx";
import Attendance from "./pages-mobile/Attendance.jsx";
import SessionDetail from "./pages-mobile/SessionDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Search from "./pages-mobile/Search.jsx";
import CourseRecruitPage from "./pages-mobile/CourseRecruitPage.jsx";
import SessionInfoPage from "./pages-mobile/SessionInfoPage.jsx";
import Certificates from "./pages-mobile/Certificates.jsx";
import KioskAttendance from "./pages/KioskAttendance.jsx";

function AppContent() {
    const location = useLocation()
    const isKioskRoute = /^\/sessions\/[^/]+\/attendance\/kiosk$/.test(location.pathname)

    return (
        <div className="min-h-screen bg-gray-50">
            {!isKioskRoute && <Header/>}
            {!isKioskRoute && <PrivacyConsentGate/>}
            <Routes>
                // 인증 관련 라우트
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

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
                <Route path="mobile/recruit/:sessionId" element={<CourseRecruitPage />}/>
                <Route path="mobile/info/:sessionId" element={<SessionInfoPage />}/>
                <Route path="mobile/certificates" element={<Certificates />}/>

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
                    <ProtectedRoute requiredRole="ADMIN" allowAssistant>
                        <SessionDetailPage/>
                    </ProtectedRoute>
                }/>
                <Route path="/lectures/:lectureId/attendances" element={
                    <ProtectedRoute requiredRole="ADMIN" allowAssistant>
                        <AttendanceTab/>
                    </ProtectedRoute>
                }/>
                <Route path="/users" element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <UserManagementPage/>
                    </ProtectedRoute>
                }/>

                // 조교 전용 라우트
                <Route path="/assistant/sessions" element={
                    <ProtectedRoute requireAssistant>
                        <AssistantSessionListPage/>
                    </ProtectedRoute>
                }/>
            </Routes>
        </div>
    )
}

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <Router>
                    <AppContent/>
                </Router>
            </AuthProvider>
        </ToastProvider>
    )
}

export default App