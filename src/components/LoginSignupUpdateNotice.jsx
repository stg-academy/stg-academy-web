import {useState} from 'react'
import Icon from './ui/Icon.jsx'
import Button from './ui/Button.jsx'
import Badge from './ui/Badge.jsx'

// 콘텐츠가 바뀌면 키를 올려서 이미 닫은 사용자에게도 새 안내를 다시 보여줄 수 있음
const STORAGE_KEY = 'notice_login_signup_update_v1_dismissed'

// 회원가입/로그인 이미지가 들어갈 자리 — 실제 이미지 준비되면 여기에 <img src="..." /> 로 교체
const ImagePlaceholder = ({label}) => (
    <div
        className="w-full aspect-video rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-neutral-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
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
            <div className="fixed inset-0 bg-neutral-900/40 z-[60]"/>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-lg border border-neutral-200 shadow-lg w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
                    <div className="px-4 py-4 border-b border-neutral-200 flex items-start justify-between ">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">시광 아카데미 업데이트 안내</h2>
                            <p className="mt-1 text-sm text-neutral-500">변경된 내용을 안내해드립니다.</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600"
                            aria-label="닫기"
                        >
                            <Icon name="x" size={24}/>
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-10 text-sm text-neutral-700">
                        <section>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-1">카카오 로그인이 사라졌어요</h3>
                            <p>기존에 카카오로 가입하셨던 분은 이름과 전화번호(또는 비밀번호)로 로그인해주세요.</p>
                        </section>

                        <ImagePlaceholder label="로그인 화면 변경 전/후"/>

                        <section>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-1">비밀번호를 몰라도 로그인할 수 있어요</h3>
                            <p>이제 두 가지 방법으로 로그인할 수 있습니다.</p>
                            <ol className="list-disc pl-5 mt-1 space-y-0.5">
                                <li>이름 + 전화번호
                                    <Badge tone="error" className="ml-2 font-normal">
                                        <Icon name={"arrow-right"} size={12} className="mr-1" />
                                        비밀번호 없이 로그인!</Badge>
                                </li>
                                <li>이름 + 비밀번호</li>
                            </ol>
                            <p className="mt-2">
                                전화번호 로그인 방법을 안내해드립니다.
                            </p>
                            <p className="mt-2">
                                1. 로그인 화면에서 <strong>이름</strong>을 입력하고, 내 정보를 클릭합니다. <br/>
                                * 동명이인이 있을 시에는 옆에 표시되는 <strong>전화번호</strong>를 확인하고 선택해주세요.
                            </p>
                            <ImagePlaceholder label="로그인 가이드 - 이름 입력"/>
                            <p className="mt-2">2. <strong>전화번호</strong>를 입력합니다.</p>
                            <p className="mt-2">3. <strong>로그인</strong> 버튼을 누릅니다.</p>
                            <ImagePlaceholder label="로그인 가이드 - 전화번호 입력"/>
                        </section>


                        <section>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-3">자주 묻는 질문</h3>
                            <div className="space-y-3">
                                <div className="bg-neutral-100 rounded-md px-2 py-4">
                                    <p className="text-lg font-semibold text-neutral-900">Q. 기존에 쓰던 비밀번호를 잊어버렸어요.</p>
                                    <p className="mt-1 text-neutral-700">김인수 전도사님 혹은 담당자(조윤호)에게 문의주시면 비밀번호를 초기화해
                                        드리겠습니다.</p>
                                </div>
                                <div className="bg-neutral-100 rounded-md px-2 py-4">
                                    <p className="text-lg font-semibold text-neutral-900">Q. 카카오로 가입했는데 제 비밀번호는
                                        무엇인가요?</p>
                                    <p className="mt-1 text-neutral-700">담당자(조윤호)에게 초기화된 비밀번호를 확인하신 후 비밀번호 변경 부탁드립니다!</p>
                                </div>
                                <div className="bg-neutral-100 rounded-md px-2 py-4">
                                    <p className="text-lg font-semibold text-neutral-900">Q. 비밀번호를 변경하고 싶어요</p>
                                    <p className="mt-1 text-neutral-700">우측 상단의 <strong>프로필 → 비밀번호 변경</strong> 메뉴를 통해
                                        비밀번호를 변경하실 수 있습니다!</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="text-neutral-500">문의사항이 있으시면 담당자에게 연락해주세요.<br/>조윤호(신촌 청년1부, 010-4133-6335)</p>
                        </section>
                    </div>

                    <div className="px-4 py-4 border-t border-neutral-200 bg-neutral-50">
                        <Button onClick={handleClose} className="w-full">
                            확인했어요
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginSignupUpdateNotice
