import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import KakaoCallback from './components/KakaoCallback'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App