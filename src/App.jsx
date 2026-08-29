// import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
// import {AuthProvider} from './contexts/AuthContext'
// import Header from './components/Header'
// import SampleDashboard from './pages/SampleDashboard'
// import SamplePage from './pages/SamplePage'
// import KakaoCallback from './components/KakaoCallback'
// import CourseManagementPage from "./pages/CourseManagementPage.jsx"
// import CourseListPage from './pages/CourseListPage'
// import SessionListPage from './pages/SessionListPage.jsx'
// import SessionDetailPage from "./pages/SessionDetailPage.jsx";
// import AttendanceTab from "./pages/AttendanceTab.jsx";
// import UserManagementPage from "./pages/UserManagementPage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
// import RegisterPage from "./pages/RegisterPage.jsx";
// import CompleteKakaoRegistration from "./pages/CompleteKakaoRegistration.jsx";
// import DesignGuidePage from "./pages/DesignGuidePage.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";
// import MyLearning from "./pages-mobile/MyLearning.jsx";
// import Home from "./pages-mobile/Home.jsx";
// import Attendance from "./pages-mobile/Attendance.jsx";
// import SessionDetail from "./pages-mobile/SessionDetail.jsx";
// import Profile from "./pages/Profile.jsx";
// import Search from "./pages-mobile/Search.jsx";
// import CourseRecruitPage from "./pages-mobile/CourseRecruitPage.jsx";
// import SessionInfoPage from "./pages-mobile/SessionInfoPage.jsx";
// import KioskAttendance from "./pages/KioskAttendance.jsx";
//
// function AppContent() {
//     // 현재 URL이 카카오 콜백인지 확인
//     const isKakaoCallback = window.location.pathname === '/auth/kakao/callback'
//
//     // 카카오 콜백 페이지인 경우 헤더 없이 렌더링
//     if (isKakaoCallback) {
//         return <KakaoCallback/>
//     }
//
//     // 일반 앱 콘텐츠
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Header/>
//             <Routes>
//                 // 인증 관련 라우트
//                 <Route path="/login" element={<LoginPage/>}/>
//                 <Route path="/register" element={<RegisterPage/>}/>
//                 <Route path="/auth/complete-registration" element={<CompleteKakaoRegistration/>}/>
//
//                 // 모든 사용자에게 공개된 라우트
//                 <Route path="/" element={<Home/>}/>
//                 <Route path="/sample" element={<SamplePage/>}/>
//                 <Route path="/design-guide" element={<DesignGuidePage/>}/>
//                 <Route path="/profile" element={<Profile />}/>
//
//                 // 모바일
//                 <Route path="mobile/home" element={<Home />}/>
//                 <Route path="mobile/my-learning" element={<MyLearning />}/>
//                 <Route path="mobile/attendance" element={<Attendance />}/>
//                 <Route path="mobile/session/:sessionId" element={<SessionDetail />}/>
//                 <Route path="mobile/search" element={<Search />}/>
//                 <Route path="mobile/recruit/:sessionId" element={<CourseRecruitPage />}/>
//                 <Route path="mobile/info/:sessionId" element={<SessionInfoPage />}/>
//
//                 // 키오스크
//                 <Route path="/sessions/:session_id/attendance/kiosk" element={<KioskAttendance />}/>
//
//                 // 관리자 전용 라우트
//                 <Route path="/courses" element={
//                     <ProtectedRoute requiredRole="ADMIN">
//                         <CourseManagementPage/>
//                     </ProtectedRoute>
//                 }>
//                     <Route index element={
//                         <ProtectedRoute requiredRole="ADMIN">
//                             <CourseListPage/>
//                         </ProtectedRoute>
//                     }/>
//                     <Route path="sessions" element={
//                         <ProtectedRoute requiredRole="ADMIN">
//                             <SessionListPage/>
//                         </ProtectedRoute>
//                     }/>
//                 </Route>
//                 <Route path="/sessions/:sessionId" element={
//                     <ProtectedRoute requiredRole="ADMIN">
//                         <SessionDetailPage/>
//                     </ProtectedRoute>
//                 }/>
//                 <Route path="/lectures/:lectureId/attendances" element={
//                     <ProtectedRoute requiredRole="ADMIN">
//                         <AttendanceTab/>
//                     </ProtectedRoute>
//                 }/>
//                 <Route path="/users" element={
//                     <ProtectedRoute requiredRole="ADMIN">
//                         <UserManagementPage/>
//                     </ProtectedRoute>
//                 }/>
//             </Routes>
//         </div>
//     )
// }
//
// function App() {
//     return (
//         <AuthProvider>
//             <Router>
//                 <Routes>
//                     <Route path="/auth/kakao/callback" element={<KakaoCallback/>}/>
//                     <Route path="/*" element={<AppContent/>}/>
//                 </Routes>
//             </Router>
//         </AuthProvider>
//     )
// }
//
// export default App

// 임시 공지 화면 (서버 작업으로 인한 접속 제한 안내)
function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <img src="/logo_grad.png" alt="STG Academy" className="h-10 w-auto"/>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-8 text-center">
                        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z"/>
                            </svg>
                        </div>

                        <h1 className="text-xl font-semibold text-gray-900">시광 아카데미 작업공지</h1>

                        <p className="mt-3 text-md text-gray-600 leading-relaxed">
                            서버 작업으로 인해 일시적으로 접속이 제한됩니다.<br/>
                            양해 부탁드립니다.
                        </p>
                        <p className="mt-3 text-md text-gray-600 leading-relaxed">
                            문의: 조윤호(010-4133-6335)
                        </p>
                    </div>

                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        <p className="text-center text-sm font-medium text-gray-700">
                            시광교회 IT위원회
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
