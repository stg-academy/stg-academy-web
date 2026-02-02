import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import KakaoLogin from './components/KakaoLogin'
import KakaoCallback from './components/KakaoCallback'

function AppContent() {
  const [count, setCount] = useState(0)

  // 현재 URL이 카카오 콜백인지 확인
  const isKakaoCallback = window.location.pathname === '/auth/kakao/callback'

  // 카카오 콜백 페이지인 경우
  if (isKakaoCallback) {
    return <KakaoCallback />
  }

  // 일반 앱 컨텐츠
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>STG Academy</h1>

      <KakaoLogin />

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App