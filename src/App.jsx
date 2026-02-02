import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import KakaoCallback from './components/KakaoCallback'

function AppContent() {
  // 현재 URL이 카카오 콜백인지 확인
  const isKakaoCallback = window.location.pathname === '/auth/kakao/callback'

  // 카카오 콜백 페이지인 경우 헤더 없이 렌더링
  if (isKakaoCallback) {
    return <KakaoCallback />
  }

  // 일반 앱 콘텐츠
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App