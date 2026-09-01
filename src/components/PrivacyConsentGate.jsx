import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ui/ToastProvider.jsx'
import { agreePrivacyConsent } from '../services/userService.js'
import Button from './ui/Button.jsx'

// 로그인 사용자 중 개인정보 활용동의(privacy_agreed_at)를 아직 하지 않은 경우
// 전체 화면을 가리는 동의 게이트. 동의해야만 앱을 계속 사용할 수 있어
// Modal(우측 슬라이드, 오버레이 클릭/ESC로 닫힘)이 아닌 별도 컴포넌트로 구현.
const PrivacyConsentGate = () => {
  const { user, isAuthenticated, needsRegistration, refreshUser } = useAuth()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const shouldShow = isAuthenticated && !needsRegistration && user && !user.privacy_agreed_at

  if (!shouldShow) return null

  const handleAgree = async () => {
    try {
      setSubmitting(true)
      await agreePrivacyConsent()
      await refreshUser()
    } catch (error) {
      console.error('개인정보 활용동의 실패:', error)
      toast.error('동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-neutral-900/40 z-[60]" />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-lg w-full max-w-lg flex flex-col max-h-[85vh]">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900">개인정보 수집 및 이용 동의</h2>
            <p className="mt-1 text-sm text-neutral-500">서비스 이용을 위해 아래 내용에 동의해주세요.</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm text-neutral-700">
            <section>
              <h3 className="font-semibold text-neutral-900 mb-1">1. 수집하는 개인정보 항목</h3>
              <p>이름, 전화번호, 출석 및 수강 이력</p>
            </section>
            <section>
              <h3 className="font-semibold text-neutral-900 mb-1">2. 수집 및 이용 목적</h3>
              <p>강의 수강신청 관리, 출석 확인 및 수료증 발급, 학습 이력 관리</p>
            </section>
            <section>
              <h3 className="font-semibold text-neutral-900 mb-1">3. 보유 및 이용 기간</h3>
              <p>회원 탈퇴 시 또는 수집 목적 달성 시까지 보유하며, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
            </section>
            <section>
              <h3 className="font-semibold text-neutral-900 mb-1">4. 동의를 거부할 권리 및 불이익</h3>
              <p>개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으며, 동의하지 않을 경우 강의 조회 및 출석 관리 등 서비스 이용에 제한이 있을 수 있습니다.</p>
            </section>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <Button onClick={handleAgree} disabled={submitting} className="w-full">
              {submitting ? '처리 중...' : '동의하고 계속하기'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacyConsentGate
