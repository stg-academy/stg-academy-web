import { useState } from 'react'
import TextInput from '../components/forms/TextInput.jsx'
import TextareaInput from '../components/forms/TextareaInput.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Modal from '../components/ui/Modal.jsx'

const DesignGuidePage = () => {
  const [activeTab, setActiveTab] = useState('colors')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    description: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // 샘플 테이블 데이터
  const sampleTableData = [
    { id: 1, name: '홍길동', email: 'hong@example.com', status: 'active', role: 'USER' },
    { id: 2, name: '김영희', email: 'kim@example.com', status: 'inactive', role: 'ADMIN' },
    { id: 3, name: '이철수', email: 'lee@example.com', status: 'active', role: 'USER' }
  ]

  const tableColumns = [
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    {
      key: 'status',
      label: '상태',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? '활성' : '비활성'}
        </span>
      )
    },
    { key: 'role', label: '역할', sortable: true }
  ]

  // 폼 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleModalSubmit = () => {
    // 샘플 검증
    const errors = {}
    if (!formData.username) errors.username = '사용자명을 입력해주세요'
    if (!formData.email) errors.email = '이메일을 입력해주세요'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    console.log('Form submitted:', formData)
    setIsModalOpen(false)
    setFormData({ username: '', email: '', description: '' })
    setFormErrors({})
  }

  // 컬러 팔레트 데이터
  const colors = {
    primary: {
      name: '프라이머리',
      colors: [
        { name: 'Blue 50', hex: '#EFF6FF', usage: '배경색' },
        { name: 'Blue 100', hex: '#DBEAFE', usage: '하이라이트 배경' },
        { name: 'Blue 500', hex: '#3B82F6', usage: '링크, 포커스' },
        { name: 'Blue 600', hex: '#2563EB', usage: '기본 버튼' },
        { name: 'Blue 700', hex: '#1D4ED8', usage: '호버 상태' }
      ]
    },
    semantic: {
      name: '시맨틱 컬러',
      colors: [
        { name: 'Green 600', hex: '#059669', usage: '성공 메시지' },
        { name: 'Red 500', hex: '#EF4444', usage: '오류 메시지' },
        { name: 'Yellow 400', hex: '#FEE500', usage: '카카오 브랜딩' },
        { name: 'Amber 900', hex: '#78350F', usage: '카카오 텍스트' }
      ]
    },
    neutral: {
      name: '중성 컬러',
      colors: [
        { name: 'Gray 50', hex: '#F9FAFB', usage: '페이지 배경' },
        { name: 'Gray 100', hex: '#F3F4F6', usage: '비활성 배경' },
        { name: 'Gray 300', hex: '#D1D5DB', usage: '보더' },
        { name: 'Gray 600', hex: '#4B5563', usage: '보조 텍스트' },
        { name: 'Gray 900', hex: '#111827', usage: '메인 텍스트' }
      ]
    }
  }

  // 탭 컴포넌트
  const tabs = [
    { id: 'colors', name: '컬러' },
    { id: 'typography', name: '타이포그래피' },
    { id: 'buttons', name: '버튼' },
    { id: 'forms', name: '폼' },
    { id: 'tables', name: '테이블' },
    { id: 'modals', name: '모달' }
  ]

  const CodeBlock = ({ code, language = 'jsx' }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
      <code>{code}</code>
    </pre>
  )

  const ExampleSection = ({ title, description, children, code }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="border border-gray-200 rounded-lg p-6 bg-white mb-4">
        {children}
      </div>
      {code && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">코드 예시:</h4>
          <CodeBlock code={code} />
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">디자인 가이드</h1>
          <p className="text-gray-600">STG Academy 프로젝트의 디자인 시스템과 컴포넌트 사용법을 안내합니다.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 컬러 탭 */}
            {activeTab === 'colors' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">컬러 시스템</h2>

                {Object.entries(colors).map(([key, colorGroup]) => (
                  <div key={key} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{colorGroup.name}</h3>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {colorGroup.colors.map((color) => (
                        <div key={color.name} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div
                            className="h-20 w-full"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <div className="p-3">
                            <div className="font-medium text-gray-900">{color.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{color.hex}</div>
                            <div className="text-xs text-gray-400 mt-1">{color.usage}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Tailwind CSS 클래스: <code className="bg-gray-100 px-2 py-1 rounded">bg-{key === 'primary' ? 'blue' : key === 'semantic' ? 'green/red/yellow' : 'gray'}-{'{number}'}</code>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 타이포그래피 탭 */}
            {activeTab === 'typography' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">타이포그래피</h2>

                <ExampleSection
                  title="제목 스타일"
                  description="페이지 제목과 섹션 제목에 사용되는 텍스트 스타일입니다."
                  code={`<h1 className="text-3xl font-bold text-gray-900">페이지 제목</h1>
<h2 className="text-2xl font-semibold text-gray-900">섹션 제목</h2>
<h3 className="text-lg font-semibold text-gray-900">서브섹션 제목</h3>`}
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">페이지 제목 (text-3xl font-bold)</h1>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">섹션 제목 (text-2xl font-semibold)</h2>
                  <h3 className="text-lg font-semibold text-gray-900">서브섹션 제목 (text-lg font-semibold)</h3>
                </ExampleSection>

                <ExampleSection
                  title="본문 텍스트"
                  description="일반 텍스트와 보조 텍스트 스타일입니다."
                  code={`<p className="text-gray-900">기본 본문 텍스트</p>
<p className="text-sm text-gray-600">보조 텍스트</p>
<p className="text-xs text-gray-500">작은 설명 텍스트</p>`}
                >
                  <p className="text-gray-900 mb-2">기본 본문 텍스트 (text-gray-900)</p>
                  <p className="text-sm text-gray-600 mb-2">보조 텍스트 (text-sm text-gray-600)</p>
                  <p className="text-xs text-gray-500">작은 설명 텍스트 (text-xs text-gray-500)</p>
                </ExampleSection>
              </div>
            )}

            {/* 버튼 탭 */}
            {activeTab === 'buttons' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">버튼</h2>

                <ExampleSection
                  title="기본 버튼"
                  description="프라이머리, 세컨더리, 그리고 특수 목적의 버튼 스타일입니다."
                  code={`// 프라이머리 버튼
<button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium">
  프라이머리 버튼
</button>

// 세컨더리 버튼
<button className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium">
  세컨더리 버튼
</button>

// 성공 버튼
<button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium">
  성공 버튼
</button>`}
                >
                  <div className="flex flex-wrap gap-4">
                    <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium">
                      프라이머리 버튼
                    </button>
                    <button className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium">
                      세컨더리 버튼
                    </button>
                    <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium">
                      성공 버튼
                    </button>
                  </div>
                </ExampleSection>

                <ExampleSection
                  title="카카오 로그인 버튼"
                  description="카카오 공식 디자인 가이드를 준수하는 버튼입니다."
                  code={`<button className="w-full flex justify-center items-center px-4 py-3 bg-[#FEE500] text-black rounded-xl hover:bg-[#F5DC00] focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 transition-all font-medium text-black/85">
  <svg className="w-5 h-5 mr-2" viewBox="0 0 18 17" fill="none">
    <path d="M9 1.5c4.687 0 8.5 3.077 8.5 6.875S13.687 15.25 9 15.25c-.875 0-1.719-.125-2.531-.344L3.5 16.75v-3.531c-1.344-1.031-2.25-2.594-2.25-4.344C1.25 4.577 5.063 1.5 9 1.5z" fill="#000000" />
  </svg>
  카카오 로그인
</button>`}
                >
                  <button className="w-full max-w-xs flex justify-center items-center px-4 py-3 bg-[#FEE500] text-black rounded-xl hover:bg-[#F5DC00] focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 transition-all font-medium text-black/85">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 18 17" fill="none">
                      <path d="M9 1.5c4.687 0 8.5 3.077 8.5 6.875S13.687 15.25 9 15.25c-.875 0-1.719-.125-2.531-.344L3.5 16.75v-3.531c-1.344-1.031-2.25-2.594-2.25-4.344C1.25 4.577 5.063 1.5 9 1.5z" fill="#000000" />
                    </svg>
                    카카오 로그인
                  </button>
                </ExampleSection>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>개발 가이드:</strong> 모든 버튼은 <code>px-4 py-3</code> 패딩, <code>rounded-lg</code> 모서리, <code>transition-all</code> 애니메이션, <code>font-medium</code> 폰트 굵기를 기본으로 사용합니다. 포커스 상태는 <code>focus:ring-2</code>와 해당 색상의 링을 적용합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 폼 탭 */}
            {activeTab === 'forms' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">폼 컴포넌트</h2>

                <ExampleSection
                  title="텍스트 입력 (TextInput 컴포넌트)"
                  description="프로젝트에서 사용하는 실제 TextInput 컴포넌트입니다."
                  code={`import TextInput from '../components/forms/TextInput.jsx'

<TextInput
  id="username"
  name="username"
  label="사용자명"
  value={formData.username}
  onChange={handleInputChange}
  placeholder="사용자명을 입력하세요"
  required={true}
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
                      required={true}
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
                      required={true}
                      error={formErrors.email}
                    />
                  </div>
                </ExampleSection>

                <ExampleSection
                  title="텍스트영역 (TextareaInput 컴포넌트)"
                  description="프로젝트에서 사용하는 실제 TextareaInput 컴포넌트입니다."
                  code={`import TextareaInput from '../components/forms/TextareaInput.jsx'

<TextareaInput
  id="description"
  name="description"
  label="설명"
  value={formData.description}
  onChange={handleInputChange}
  placeholder="설명을 입력하세요"
  rows={4}
  description="상세한 설명을 작성해주세요"
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

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>개발 가이드:</strong> 모든 입력 필드는 <code>px-4 py-3</code> 패딩, <code>border-gray-300</code> 기본 테두리, <code>rounded-lg</code> 모서리를 사용합니다. 포커스 시 <code>focus:ring-2 focus:ring-blue-500</code>와 <code>focus:border-transparent</code>를 적용하고, 오류 시 <code>border-red-500</code>를 사용합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 테이블 탭 */}
            {activeTab === 'tables' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">테이블</h2>

                <ExampleSection
                  title="데이터 테이블 (DataTable 컴포넌트)"
                  description="프로젝트에서 사용하는 실제 DataTable 컴포넌트입니다. 정렬, 검색 기능이 포함되어 있습니다."
                  code={`import DataTable from '../components/ui/DataTable.jsx'

const columns = [
  { key: 'name', label: '이름', sortable: true },
  { key: 'email', label: '이메일', sortable: true },
  {
    key: 'status',
    label: '상태',
    render: (value) => (
      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }\`}>
        {value === 'active' ? '활성' : '비활성'}
      </span>
    )
  },
  { key: 'role', label: '역할', sortable: true }
]

<DataTable
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

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>개발 가이드:</strong> DataTable 컴포넌트는 정렬, 필터링, 페이지네이션 기능을 포함합니다. 헤더는 <code>bg-gray-50</code>, 행은 <code>hover:bg-gray-50</code>을 적용하고, 상태 배지는 <code>px-2 py-1 rounded-full text-xs font-medium</code> 스타일을 사용합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 모달 탭 */}
            {activeTab === 'modals' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">모달</h2>

                <ExampleSection
                  title="모달 (Modal 컴포넌트)"
                  description="프로젝트에서 사용하는 실제 Modal 컴포넌트입니다. 우측에서 슬라이드되는 사이드 모달 형태입니다."
                  code={`import Modal from '../components/ui/Modal.jsx'
import TextInput from '../components/forms/TextInput.jsx'

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="사용자 추가"
  onSubmit={handleModalSubmit}
  submitText="저장"
>
  <div className="space-y-4">
    <TextInput
      id="username"
      name="username"
      label="사용자명"
      value={formData.username}
      onChange={handleInputChange}
      required={true}
      error={formErrors.username}
    />
    <TextInput
      id="email"
      name="email"
      label="이메일"
      value={formData.email}
      onChange={handleInputChange}
      required={true}
      error={formErrors.email}
    />
    <TextareaInput
      id="description"
      name="description"
      label="설명"
      value={formData.description}
      onChange={handleInputChange}
      rows={3}
    />
  </div>
</Modal>`}
                >
                  <div className="text-center">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
                    >
                      모달 열기 (실제 Modal 컴포넌트)
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      버튼을 클릭하면 우측에서 슬라이드되는 실제 모달이 열립니다
                    </p>
                  </div>

                  {/* 실제 Modal 컴포넌트 */}
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
                        placeholder="사용자명을 입력하세요"
                        required={true}
                        error={formErrors.username}
                      />
                      <TextInput
                        id="modal-email"
                        name="email"
                        label="이메일"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="이메일을 입력하세요"
                        required={true}
                        error={formErrors.email}
                      />
                      <TextareaInput
                        id="modal-description"
                        name="description"
                        label="설명"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="설명을 입력하세요"
                        rows={3}
                      />
                    </div>
                  </Modal>
                </ExampleSection>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <strong>개발 가이드:</strong> Modal 컴포넌트는 오버레이 배경(<code>bg-black bg-opacity-50</code>)과 중앙 정렬된 컨텐츠 영역을 제공합니다. 모달 버튼은 일반적으로 우측 정렬하고, 취소 버튼은 보조 스타일, 확인 버튼은 프라이머리 스타일을 사용합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignGuidePage