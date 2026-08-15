import { useState } from 'react'
import PageContainer from '../components/ui/PageContainer.jsx'
import TabNav from '../components/ui/TabNav.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Modal from '../components/ui/Modal.jsx'
import BottomSheet from '../components/ui/BottomSheet.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs.jsx'
import TextInput from '../components/forms/TextInput.jsx'
import TextareaInput from '../components/forms/TextareaInput.jsx'
import SelectInput from '../components/forms/SelectInput.jsx'
import { useToast } from '../components/ui/ToastProvider.jsx'

// 공용 프레젠테이션 헬퍼 ---------------------------------------------------

const CodeBlock = ({ code }) => (
    <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-md overflow-x-auto text-sm">
        <code>{code}</code>
    </pre>
)

const ExampleSection = ({ title, description, children, code }) => (
    <div className="mb-10">
        <h3 className="text-section-title text-neutral-900 mb-1">{title}</h3>
        {description && <p className="text-body text-neutral-500 mb-4">{description}</p>}
        <Card className="mb-4">{children}</Card>
        {code && (
            <div>
                <h4 className="text-label text-neutral-600 mb-2">코드 예시</h4>
                <CodeBlock code={code} />
            </div>
        )}
    </div>
)

const Swatch = ({ className, hex, name, usage }) => (
    <div className="border border-neutral-200 rounded-md overflow-hidden">
        <div className={`h-16 w-full ${className}`} />
        <div className="p-3">
            <div className="text-label text-neutral-900">{name}</div>
            <div className="text-micro text-neutral-500 font-mono">{hex}</div>
            {usage && <div className="text-micro text-neutral-400 mt-0.5">{usage}</div>}
        </div>
    </div>
)

const StatusDot = ({ toneSoft, toneDot, toneText, label }) => (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 ${toneSoft}`}>
        <span className={`w-[7px] h-[7px] rounded-full ${toneDot}`} />
        <span className={`text-micro font-semibold ${toneText}`}>{label}</span>
    </div>
)

// 컬러 팔레트 (실제 @theme 토큰과 1:1 대응) ---------------------------------

const neutralScale = [
    { step: '0', className: 'bg-neutral-0 border-b border-neutral-200', hex: '#FFFFFF', usage: '카드/모달 표면' },
    { step: '50', className: 'bg-neutral-50', hex: '#F9FAFB', usage: '페이지 배경 아님 — 표면 대비용' },
    { step: '100', className: 'bg-neutral-100', hex: '#F3F4F6', usage: '보조 버튼, 비활성 배경' },
    { step: '200', className: 'bg-neutral-200', hex: '#E5E7EB', usage: '보더' },
    { step: '300', className: 'bg-neutral-300', hex: '#D1D5DB', usage: '인풋 보더' },
    { step: '400', className: 'bg-neutral-400', hex: '#9CA3AF', usage: '플레이스홀더' },
    { step: '500', className: 'bg-neutral-500', hex: '#6B7280', usage: '비활성 탭 텍스트' },
    { step: '600', className: 'bg-neutral-600', hex: '#4B5563', usage: '보조 텍스트' },
    { step: '700', className: 'bg-neutral-700', hex: '#374151', usage: '레이블' },
    { step: '800', className: 'bg-neutral-800', hex: '#1F2937', usage: '거의 사용 안 함' },
    { step: '900', className: 'bg-neutral-900', hex: '#111827', usage: '메인 텍스트' },
]

const semanticGroups = [
    { key: 'success', label: '성공', soft: 'bg-success-soft', base: 'bg-success', text: 'text-success-text', hexBase: '#22C55E', hexSoft: '#F0FDF4' },
    { key: 'error', label: '오류', soft: 'bg-error-soft', base: 'bg-error', text: 'text-error-text', hexBase: '#F43F5E', hexSoft: '#FFF1F2' },
    { key: 'warning', label: '경고', soft: 'bg-warning-soft', base: 'bg-warning', text: 'text-warning-text', hexBase: '#F59E0B', hexSoft: '#FFF7ED' },
    { key: 'info', label: '정보', soft: 'bg-info-soft', base: 'bg-info', text: 'text-info-text', hexBase: '#3B82F6', hexSoft: '#EFF6FF' },
]

// 타이포그래피 7단계 스케일 ---------------------------------------------

const typeScale = [
    { name: 'text-display', label: 'Display', spec: '28px / 36px / 700' },
    { name: 'text-page-title', label: 'Page Title', spec: '24px / 32px / 700' },
    { name: 'text-section-title', label: 'Section Title', spec: '18px / 28px / 600' },
    { name: 'text-body-lg', label: 'Body LG', spec: '16px / 24px / 400' },
    { name: 'text-body', label: 'Body', spec: '14px / 20px / 400' },
    { name: 'text-label', label: 'Label', spec: '13px / 18px / 500' },
    { name: 'text-micro', label: 'Micro', spec: '12px / 16px / 500' },
]

// 샘플 테이블 데이터 ---------------------------------------------------

const sampleTableData = [
    { id: 1, name: '홍길동', email: 'hong@example.com', status: 'active', role: '관리자' },
    { id: 2, name: '김영희', email: 'kim@example.com', status: 'inactive', role: '일반' },
    { id: 3, name: '이철수', email: 'lee@example.com', status: 'active', role: '일반' },
]

const tableColumns = [
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    {
        key: 'status',
        label: '상태',
        render: (value) => (
            <Badge tone={value === 'active' ? 'success' : 'neutral'}>
                {value === 'active' ? '활성' : '비활성'}
            </Badge>
        ),
    },
    { key: 'role', label: '역할', sortable: true },
]

const GUIDE_TABS = [
    { key: 'colors', label: '컬러' },
    { key: 'typography', label: '타이포그래피' },
    { key: 'foundations', label: '스페이싱·라운드·섀도우' },
    { key: 'forms', label: '폼' },
    { key: 'data', label: '데이터' },
    { key: 'navigation', label: '내비게이션' },
    { key: 'feedback', label: '피드백' },
]

const DesignGuidePage = () => {
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('colors')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const [formData, setFormData] = useState({ username: '', email: '', description: '', status: '' })
    const [formErrors, setFormErrors] = useState({})

    const [checkedDemo, setCheckedDemo] = useState(true)
    const [navDemoActive, setNavDemoActive] = useState('list')
    const [paginationPage, setPaginationPage] = useState(3)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleModalSubmit = () => {
        const errors = {}
        if (!formData.username) errors.username = '사용자명을 입력해주세요'
        if (!formData.email) errors.email = '이메일을 입력해주세요'
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        setIsModalOpen(false)
        setFormErrors({})
    }

    return (
        <PageContainer>
            <div className="mb-8">
                <h1 className="text-page-title text-neutral-900 mb-2">디자인 가이드</h1>
                <p className="text-body text-neutral-500">
                    STG Academy 디자인 시스템 v2의 토큰·컴포넌트를 실제 프로젝트 코드로 확인합니다.
                </p>
            </div>

            <Card className="mb-8 !p-0 overflow-hidden">
                <div className="px-6 pt-2">
                    <TabNav tabs={GUIDE_TABS} active={activeTab} onChange={setActiveTab} />
                </div>

                <div className="p-6">
                    {/* 컬러 탭 */}
                    {activeTab === 'colors' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">컬러 시스템</h2>

                            <div className="mb-10">
                                <h3 className="text-section-title text-neutral-900 mb-4">뉴트럴 스케일</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {neutralScale.map((c) => (
                                        <Swatch key={c.step} className={c.className} hex={c.hex} name={`neutral-${c.step}`} usage={c.usage} />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-section-title text-neutral-900 mb-4">액센트 (Blue)</h3>
                                <p className="text-body text-neutral-500 mb-4">
                                    감사 이전 3가지 회색 + 1가지 파랑으로 흩어져 있던 &quot;프라이머리&quot; 색을 이 하나의 액센트로 통합했습니다.
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <Swatch className="bg-accent" hex="#2563EB" name="accent" usage="포커스 링, 링크, 선택 상태" />
                                    <Swatch className="bg-accent-hover" hex="#1D4ED8" name="accent-hover" usage="호버 상태" />
                                    <Swatch className="bg-accent-soft" hex="#EFF6FF" name="accent-soft" usage="소프트 배경, 포커스 링" />
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-section-title text-neutral-900 mb-4">시맨틱 컬러</h3>
                                <p className="text-body text-neutral-500 mb-4">
                                    성공/오류/경고/정보 각각 진한 색(뱃지 도트·아이콘용) + 소프트 배경 + 텍스트 톤 3종 세트.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {semanticGroups.map((g) => (
                                        <div key={g.key} className="border border-neutral-200 rounded-md overflow-hidden">
                                            <div className={`h-16 w-full ${g.base}`} />
                                            <div className={`p-3 ${g.soft}`}>
                                                <div className="text-label text-neutral-900 mb-1">{g.label}</div>
                                                <div className="text-micro text-neutral-500 font-mono mb-1">{g.hexBase}</div>
                                                <div className={`text-micro font-semibold ${g.text}`}>텍스트 예시</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <ExampleSection
                                title="상태 dot + 라벨 패턴"
                                description="테이블 안에서 쓰는 Badge와는 별개로, 페이지 상단의 실시간 상태 배너에 쓰는 캡슐형 패턴입니다 (Figma 시안 유래)."
                                code={`<span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-success-soft">
  <span className="w-[7px] h-[7px] rounded-full bg-success" />
  <span className="text-micro font-semibold text-success-text">모든 강좌 출석 정상</span>
</span>`}
                            >
                                <div className="flex flex-wrap gap-3">
                                    <StatusDot toneSoft="bg-success-soft" toneDot="bg-success" toneText="text-success-text" label="모든 강좌 출석 정상" />
                                    <StatusDot toneSoft="bg-info-soft" toneDot="bg-info" toneText="text-info-text" label="실시간 업데이트" />
                                    <StatusDot toneSoft="bg-warning-soft" toneDot="bg-warning" toneText="text-warning-text" label="보강 대기 3건" />
                                </div>
                            </ExampleSection>
                        </div>
                    )}

                    {/* 타이포그래피 탭 */}
                    {activeTab === 'typography' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-2">타이포그래피</h2>
                            <p className="text-body text-neutral-500 mb-6">
                                UI 전체는 시스템 산세리프(<code className="bg-neutral-100 px-1.5 py-0.5 rounded text-micro">font-sans</code>)만 사용합니다.
                                다운로드 폰트는 워드마크 전용입니다.
                            </p>

                            <div className="mb-10 border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                                {typeScale.map((t) => (
                                    <div key={t.name} className="flex items-center justify-between gap-4 px-5 py-4">
                                        <span className={`${t.name} text-neutral-900`}>시광 아카데미 관리자 대시보드</span>
                                        <div className="flex-none text-right">
                                            <div className="text-label text-neutral-700">{t.label}</div>
                                            <div className="text-micro text-neutral-400 font-mono">{t.spec}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <ExampleSection
                                title="워드마크 (SEBANG Gothic)"
                                description="로고타이프와 큰 숫자에만 사용 — 본문/UI 라벨에는 절대 사용하지 않습니다."
                                code={`<span className="font-stg-title text-page-title text-neutral-900">시광 아카데미</span>`}
                            >
                                <span className="font-stg-title text-page-title text-neutral-900">시광 아카데미</span>
                            </ExampleSection>
                        </div>
                    )}

                    {/* 파운데이션 탭 */}
                    {activeTab === 'foundations' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">스페이싱 · 라운드 · 섀도우</h2>

                            <div className="mb-10">
                                <h3 className="text-section-title text-neutral-900 mb-1">스페이싱</h3>
                                <p className="text-body text-neutral-500 mb-4">
                                    4px 배수 스케일. 페이지 컨테이너 패딩은 가로 24px / 세로 32px, 버튼(md) 내부 패딩은 가로 16px / 세로 8px로 통일되어 있습니다.
                                </p>
                                <div className="flex flex-col gap-2">
                                    {[4, 8, 12, 16, 24, 32, 48, 64].map((px) => (
                                        <div key={px} className="flex items-center gap-3">
                                            <div className="w-12 text-micro text-neutral-500 font-mono">{px}px</div>
                                            <div className="h-3 bg-accent rounded-sm" style={{ width: `${px * 2}px` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="text-section-title text-neutral-900 mb-4">라운드</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 rounded-sm" />
                                        <span className="text-micro text-neutral-500">sm · 6px (배지)</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 rounded-md" />
                                        <span className="text-micro text-neutral-500">md · 8px (버튼/인풋/카드)</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 rounded-lg" />
                                        <span className="text-micro text-neutral-500">lg · 12px (모달/시트)</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-20 h-20 bg-neutral-100 border border-neutral-300 rounded-full" />
                                        <span className="text-micro text-neutral-500">full · 999px (필/아바타)</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-section-title text-neutral-900 mb-1">섀도우 / 엘리베이션</h3>
                                <p className="text-body text-neutral-500 mb-4">
                                    카드·버튼·인풋은 기본값이 <strong>테두리</strong>입니다. 그림자는 &quot;띄워진&quot; 상태(카드 호버, 모달/시트/토스트)에만 사용합니다.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-5 bg-white border border-neutral-200 rounded-lg">
                                        <div className="text-label text-neutral-900 mb-1">기본 카드</div>
                                        <div className="text-micro text-neutral-500">테두리만, 그림자 없음</div>
                                    </div>
                                    <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-sm">
                                        <div className="text-label text-neutral-900 mb-1">호버 상태</div>
                                        <div className="text-micro text-neutral-500">shadow-sm</div>
                                    </div>
                                    <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-lg">
                                        <div className="text-label text-neutral-900 mb-1">모달 / 시트 / 토스트</div>
                                        <div className="text-micro text-neutral-500">shadow-lg</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 폼 탭 */}
                    {activeTab === 'forms' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">폼 컴포넌트</h2>

                            <ExampleSection
                                title="버튼 (Button 컴포넌트)"
                                description="Primary는 흰 배경 + 연한 회색 테두리 + 검정 텍스트입니다 (채워진 색이 아님) — 감사에서 발견된 4종의 primary 색을 이 하나로 통합했습니다."
                                code={`import Button from '../components/ui/Button.jsx'

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="danger">Danger</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="link">Link</Button>
                                    <Button variant="primary" disabled>Disabled</Button>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="텍스트 입력 (TextInput 컴포넌트)"
                                description="포커스 시 accent 3px 소프트 링, 오류 시 error 보더."
                                code={`<TextInput
  id="username"
  name="username"
  label="사용자명"
  value={formData.username}
  onChange={handleInputChange}
  placeholder="사용자명을 입력하세요"
  required
  error={formErrors.username}
  description="3자 이상의 사용자명을 입력해주세요"
/>`}
                            >
                                <div className="space-y-4 max-w-md">
                                    <TextInput
                                        id="demo-username"
                                        name="username"
                                        label="사용자명"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="사용자명을 입력하세요"
                                        required
                                        error={formErrors.username}
                                        description="3자 이상의 사용자명을 입력해주세요"
                                    />
                                    <TextInput
                                        id="demo-email"
                                        name="email"
                                        label="이메일 (오류 상태 예시)"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="이메일을 입력하세요"
                                        required
                                        error={formErrors.email}
                                    />
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="셀렉트박스 (Select 컴포넌트)"
                                description="네이티브 select는 펼침 패널을 커스텀 스타일할 수 없어 직접 구현했습니다 — 열림 상태는 accent-soft 하이라이트 + 체크마크."
                                code={`<SelectInput
  id="status"
  name="status"
  label="진행 상태"
  value={formData.status}
  onChange={handleInputChange}
  options={[
    { value: 'in_progress', label: '진행중' },
    { value: 'recruiting', label: '모집중' },
    { value: 'done', label: '완료' },
  ]}
  placeholder="전체 상태"
/>`}
                            >
                                <div className="max-w-xs">
                                    <SelectInput
                                        id="demo-status"
                                        name="status"
                                        label="진행 상태"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        options={[
                                            { value: 'in_progress', label: '진행중' },
                                            { value: 'recruiting', label: '모집중' },
                                            { value: 'done', label: '완료' },
                                        ]}
                                        placeholder="전체 상태"
                                    />
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="체크박스 (Checkbox 컴포넌트)"
                                description="체크 시 accent 채움."
                                code={`<Checkbox label="알림 수신" checked={checked} onChange={setChecked} />`}
                            >
                                <div className="flex flex-wrap gap-6">
                                    <Checkbox id="chk-1" label="알림 수신" checked={checkedDemo} onChange={setCheckedDemo} />
                                    <Checkbox id="chk-2" label="선택 안 됨" checked={false} onChange={() => {}} />
                                    <Checkbox id="chk-3" label="비활성" checked={true} disabled />
                                    <Checkbox id="chk-4" label="오류" checked={false} error onChange={() => {}} />
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="텍스트영역 (TextareaInput 컴포넌트)"
                                code={`<TextareaInput
  id="description"
  name="description"
  label="설명"
  value={formData.description}
  onChange={handleInputChange}
  rows={4}
/>`}
                            >
                                <div className="max-w-md">
                                    <TextareaInput
                                        id="demo-description"
                                        name="description"
                                        label="설명"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="설명을 입력하세요"
                                        rows={4}
                                        description="상세한 설명을 작성해주세요"
                                    />
                                </div>
                            </ExampleSection>
                        </div>
                    )}

                    {/* 데이터 탭 */}
                    {activeTab === 'data' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">데이터 컴포넌트</h2>

                            <ExampleSection
                                title="카드 (Card 컴포넌트)"
                                description="기본은 테두리만, 그림자 없음. hover prop을 주면 호버 시 shadow-sm."
                                code={`<Card>기본 카드</Card>
<Card hover>호버 시 그림자가 생기는 카드</Card>
<Card footer={<span>푸터 영역</span>}>본문</Card>`}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Card>
                                        <div className="text-label text-neutral-900 mb-1">기본 카드</div>
                                        <div className="text-micro text-neutral-500">border만, 그림자 없음</div>
                                    </Card>
                                    <Card hover>
                                        <div className="text-label text-neutral-900 mb-1">hover 카드</div>
                                        <div className="text-micro text-neutral-500">마우스를 올려보세요</div>
                                    </Card>
                                    <Card footer={<span className="text-micro text-neutral-500">푸터 · 1px 구분선</span>}>
                                        <div className="text-label text-neutral-900 mb-1">푸터 있는 카드</div>
                                        <div className="text-micro text-neutral-500">본문 + 하단 구분선</div>
                                    </Card>
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="배지 (Badge 컴포넌트)"
                                description="테두리 없음, 소프트 배경 + 텍스트 톤 5종. 감사에서 발견된 5가지 padding/border 변형을 이 하나로 통합했습니다."
                                code={`<Badge tone="neutral">neutral</Badge>
<Badge tone="info">info</Badge>
<Badge tone="success">success</Badge>
<Badge tone="warning">warning</Badge>
<Badge tone="error">error</Badge>`}
                            >
                                <div className="flex flex-wrap gap-2">
                                    <Badge tone="neutral">neutral</Badge>
                                    <Badge tone="info">info</Badge>
                                    <Badge tone="success">success</Badge>
                                    <Badge tone="warning">warning</Badge>
                                    <Badge tone="error">error</Badge>
                                </div>
                            </ExampleSection>

                            <ExampleSection
                                title="테이블 (DataTable 컴포넌트)"
                                description="정렬·검색·페이지네이션 포함. 행에 줄무늬(zebra striping) 없음 — 모든 행이 흰 배경입니다. lg 미만에서는 자동으로 카드 리스트로 전환됩니다."
                                code={`<DataTable
  title="사용자 목록"
  data={sampleTableData}
  columns={columns}
  searchableColumns={['name', 'email']}
  itemsPerPage={10}
/>`}
                            >
                                <DataTable
                                    title="사용자 목록"
                                    data={sampleTableData}
                                    columns={tableColumns}
                                    searchableColumns={['name', 'email']}
                                    itemsPerPage={10}
                                />
                            </ExampleSection>
                        </div>
                    )}

                    {/* 내비게이션 탭 */}
                    {activeTab === 'navigation' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">내비게이션</h2>

                            <ExampleSection
                                title="탭 — 자체 상태형 (Tabs 컴포넌트)"
                                description="모바일/모달 등 자체적으로 열림 상태를 들고 있는 세그먼트형 탭."
                                code={`<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">목록</TabsTrigger>
    <TabsTrigger value="detail">상세</TabsTrigger>
  </TabsList>
  <TabsContent value="list">목록 콘텐츠</TabsContent>
  <TabsContent value="detail">상세 콘텐츠</TabsContent>
</Tabs>`}
                            >
                                <Tabs defaultValue="list" className="max-w-sm">
                                    <TabsList>
                                        <TabsTrigger value="list">목록</TabsTrigger>
                                        <TabsTrigger value="detail">상세</TabsTrigger>
                                        <TabsTrigger value="settings">설정</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="list" className="text-body text-neutral-600">목록 콘텐츠입니다.</TabsContent>
                                    <TabsContent value="detail" className="text-body text-neutral-600">상세 콘텐츠입니다.</TabsContent>
                                    <TabsContent value="settings" className="text-body text-neutral-600">설정 콘텐츠입니다.</TabsContent>
                                </Tabs>
                            </ExampleSection>

                            <ExampleSection
                                title="탭 — 라우터 연동형 (TabNav 컴포넌트)"
                                description="언더라인 스타일. `to`가 있으면 Link, 없으면 onChange로 같은 페이지 내 전환 — 이 가이드 페이지 상단 탭도 이 컴포넌트입니다."
                                code={`<TabNav
  tabs={[{ key: 'list', label: '목록' }, { key: 'detail', label: '상세' }]}
  active={active}
  onChange={setActive}
/>`}
                            >
                                <TabNav
                                    tabs={[
                                        { key: 'list', label: '목록' },
                                        { key: 'detail', label: '상세' },
                                        { key: 'settings', label: '설정' },
                                    ]}
                                    active={navDemoActive}
                                    onChange={setNavDemoActive}
                                />
                                <p className="text-body text-neutral-600 mt-4">현재 선택: {navDemoActive}</p>
                            </ExampleSection>

                            <ExampleSection
                                title="페이지네이션 (Pagination 컴포넌트)"
                                description="박스형 칩이 아닌 텍스트 스타일 — ‹ 이전 1 2 3 다음 ›"
                                code={`<Pagination current={page} total={7} onChange={setPage} />`}
                            >
                                <Pagination current={paginationPage} total={7} onChange={setPaginationPage} />
                            </ExampleSection>
                        </div>
                    )}

                    {/* 피드백 탭 */}
                    {activeTab === 'feedback' && (
                        <div>
                            <h2 className="text-page-title text-neutral-900 mb-6">피드백 컴포넌트</h2>

                            <ExampleSection
                                title="모달 (Modal 컴포넌트)"
                                description="우측에서 슬라이드되는 사이드 패널. md 미만 화면에서는 전체 화면으로 전환됩니다."
                                code={`<Modal isOpen={isOpen} onClose={close} title="사용자 추가" onSubmit={handleSubmit} submitText="저장">
  ...
</Modal>`}
                            >
                                <Button onClick={() => setIsModalOpen(true)}>모달 열기</Button>
                                <Modal
                                    isOpen={isModalOpen}
                                    onClose={() => setIsModalOpen(false)}
                                    title="사용자 추가"
                                    onSubmit={handleModalSubmit}
                                    submitText="저장"
                                >
                                    <div className="space-y-4">
                                        <TextInput
                                            id="modal-username"
                                            name="username"
                                            label="사용자명"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                            error={formErrors.username}
                                        />
                                        <TextInput
                                            id="modal-email"
                                            name="email"
                                            label="이메일"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            error={formErrors.email}
                                        />
                                    </div>
                                </Modal>
                            </ExampleSection>

                            <ExampleSection
                                title="하단 시트 (BottomSheet 컴포넌트)"
                                description="모바일 카드 리스트(lg 미만)에서 행을 편집할 때 쓰는 하단 고정 시트. Modal과 동일한 생명주기를 하단 앵커로 재사용합니다."
                                code={`<BottomSheet isOpen={isOpen} onClose={close} title="편집" footer={...}>
  ...
</BottomSheet>`}
                            >
                                <Button onClick={() => setIsSheetOpen(true)}>시트 열기</Button>
                                <BottomSheet
                                    isOpen={isSheetOpen}
                                    onClose={() => setIsSheetOpen(false)}
                                    title="빠른 편집"
                                    footer={
                                        <div className="flex gap-2">
                                            <Button variant="secondary" className="flex-1" onClick={() => setIsSheetOpen(false)}>취소</Button>
                                            <Button className="flex-1" onClick={() => setIsSheetOpen(false)}>저장</Button>
                                        </div>
                                    }
                                >
                                    <p className="text-body text-neutral-600">모바일 폭에서 열리는 시트와 동일한 컴포넌트입니다.</p>
                                </BottomSheet>
                            </ExampleSection>

                            <ExampleSection
                                title="확인 모달 (ConfirmModal 컴포넌트)"
                                description="네이티브 confirm()을 대체 — Toast는 fire-and-forget이라 예/아니오 결정을 게이팅할 수 없어 별도로 존재합니다."
                                code={`<ConfirmModal isOpen={isOpen} onClose={close} onConfirm={confirm} title="삭제" message="정말 삭제하시겠습니까?" danger />`}
                            >
                                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>삭제 확인 열기</Button>
                                <ConfirmModal
                                    isOpen={isConfirmOpen}
                                    onClose={() => setIsConfirmOpen(false)}
                                    onConfirm={() => toast.success('삭제되었습니다.')}
                                    title="삭제"
                                    message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                                    confirmText="삭제"
                                    danger
                                />
                            </ExampleSection>

                            <ExampleSection
                                title="토스트 (Toast 컴포넌트)"
                                description="native alert()/confirm() 7건 이상을 대체한 컴포넌트. useToast() 훅으로 어디서든 호출합니다."
                                code={`const toast = useToast()
toast.success('저장되었습니다!')
toast.error('저장에 실패했습니다.')
toast.warning('이미 처리된 항목입니다.')
toast.info('처리할 항목이 없습니다.')`}
                            >
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="secondary" onClick={() => toast.success('저장되었습니다!')}>Success</Button>
                                    <Button variant="secondary" onClick={() => toast.error('저장에 실패했습니다.')}>Error</Button>
                                    <Button variant="secondary" onClick={() => toast.warning('이미 처리된 항목입니다.')}>Warning</Button>
                                    <Button variant="secondary" onClick={() => toast.info('처리할 항목이 없습니다.')}>Info</Button>
                                </div>
                            </ExampleSection>
                        </div>
                    )}
                </div>
            </Card>
        </PageContainer>
    )
}

export default DesignGuidePage
