import { useState } from 'react'
import Icon from './ui/Icon.jsx'

// 콘텐츠가 바뀌면 키를 올려서 이미 닫은 사용자에게도 새 안내를 다시 보여줄 수 있음
const STORAGE_KEY = 'notice_login_signup_update_v1_dismissed'

// 회원가입/로그인 이미지가 들어갈 자리 — 실제 이미지 준비되면 여기에 <img src="..." /> 로 교체
const ImagePlaceholder = ({ label }) => (
    <div className="w-full aspect-video rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-neutral-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="text-xs">{label}</span>
    </div>
)

// 홈 화면 진입 시 1회 노출되는 "회원가입/로그인 방식 변경 안내" 팝업.
// PrivacyConsentGate와 동일한 오버레이+카드 UI를 쓰되, 동의가 아니라 안내용이라 X로 닫을 수 있다.
// 닫으면 localStorage에 기록해 다시 열리지 않는다.
const LoginSignupUpdateNotice = () => {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, 'true')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <>
            <div className="fixed inset-0 bg-neutral-900/40 z-[60]" />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg border border-neutral-200 shadow-lg w-full max-w-lg flex flex-col max-h-[80vh]">
                    <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">회원가입/로그인 방식이 바뀌었어요</h2>
                            <p className="mt-1 text-sm text-neutral-500">변경된 내용을 안내해드립니다.</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
                            aria-label="닫기"
                        >
                            <Icon name="x" size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm text-neutral-700">
                        <section>
                            <h3 className="font-semibold text-neutral-900 mb-1">카카오 로그인이 사라졌어요</h3>
                            <p>카카오 로그인/회원가입 기능이 완전히 제거되었습니다. 기존에 카카오로 가입하셨던 분은 이름과 비밀번호(또는 전화번호)로 로그인해주세요.</p>
                        </section>

                        <ImagePlaceholder label="로그인 화면 변경 전/후" />

                        <section>
                            <h3 className="font-semibold text-neutral-900 mb-1">로그인 방법이 달라졌어요</h3>
                            <p>이제 두 가지 방법으로 로그인할 수 있습니다.</p>
                            <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                <li>이름 + 비밀번호</li>
                                <li>이름 + 전화번호 (비밀번호 없이 로그인)</li>
                            </ul>
                            <p className="mt-2">이름을 2글자 이상 입력하면 동명이인을 구분할 수 있도록 검색 결과가 표시됩니다. 검색 결과에서 본인을 선택하면 소속 정보와 전화번호 뒷자리가 함께 표시되어 본인이 맞는지 확인할 수 있습니다.</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-neutral-900 mb-1">회원가입 절차가 간단해졌어요</h3>
                            <p>이름과 전화번호를 함께 입력하고 <strong>확인</strong> 버튼을 누르면 바로 가입 가능 여부를 알려드립니다.</p>
                            <ul className="list-disc pl-5 mt-1 space-y-0.5">
                                <li>"회원가입 가능한 사용자입니다" → 소속 정보와 비밀번호만 입력하면 가입 완료</li>
                                <li>"이미 가입된 사용자입니다" → 로그인 화면에서 로그인해주세요</li>
                            </ul>
                            <p className="mt-2">전화번호는 이제 회원가입 시 필수로 입력합니다.</p>
                        </section>

                        <ImagePlaceholder label="회원가입 화면 변경 전/후" />

                        <section>
                            <p className="text-neutral-500">문의사항이 있으시면 담당자에게 연락해주세요.</p>
                        </section>
                    </div>

                    <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                        <button
                            onClick={handleClose}
                            className="w-full h-11 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
                        >
                            확인했어요
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginSignupUpdateNotice
