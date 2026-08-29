import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageContainer from './ui/PageContainer.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Icon from './ui/Icon.jsx'

const PhoneLoginAdminNotice = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleReLogin = async () => {
    try {
      setLoggingOut(true)
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <PageContainer minWidth={false} className="flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-warning-soft rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="lock" size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          관리자 메뉴는 비밀번호 로그인을 통해 이용하실 수 있습니다
        </h2>
        <Button
          onClick={handleReLogin}
          disabled={loggingOut}
          className="w-full mt-6"
        >
          {loggingOut ? '로그아웃 중...' : '다시 로그인하기'}
        </Button>
      </Card>
    </PageContainer>
  )
}

export default PhoneLoginAdminNotice
