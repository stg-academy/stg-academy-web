# STG Academy 웹 대시보드 프로젝트

## 프로젝트 개요
React와 TailwindCSS를 사용한 웹 기반 대시보드 UI 프로젝트입니다. 카카오 로그인 인증 시스템과 다양한 위젯 컴포넌트를 포함한 관리자 대시보드를 제공합니다.

## 기술 스택
- **Frontend**: React 19.2.0 (함수형 컴포넌트, Hooks)
- **Styling**: TailwindCSS v4.1.18
- **Routing**: React Router DOM v7.13.0
- **Build Tool**: Vite v7.2.4
- **Authentication**: 카카오 OAuth 2.0

## 파일 구조
```
src/
├── components/
│   ├── Header.jsx                 # 상단 헤더 (네비게이션, 사용자 메뉴)
│   ├── LoginRequired.jsx          # 로그인 요구 페이지
│   ├── KakaoCallback.jsx          # 카카오 로그인 콜백 처리
│   └── widgets/
│       ├── StatCard.jsx           # 통계 카드 위젯
│       ├── ChartCard.jsx          # 차트 위젯
│       ├── ActivityCard.jsx       # 활동 피드 위젯
│       ├── TaskCard.jsx           # 할 일 목록 위젯
│       └── DataTable.jsx          # 데이터 테이블 위젯
├── pages/
│   ├── SampleDashboard.jsx        # 샘플 대시보드 페이지
│   └── SamplePage.jsx             # 샘플 페이지 (테이블 중심)
├── contexts/
│   └── AuthContext.jsx            # 인증 상태 관리
├── config/
│   └── kakao.js                   # 카카오 OAuth 설정
├── utils/
│   └── authService.js                     # API 클라이언트
└── App.jsx                        # 메인 앱 컴포넌트
```

## 라우팅 구조
- `/` - 샘플 대시보드
- `/sample` - 샘플 페이지
- `/auth/kakao/callback` - 카카오 로그인 콜백

## 레이아웃 시스템

### 전체 구조
- **최대 너비**: `max-w-7xl` (1280px)
- **중앙 정렬**: `mx-auto`
- **패딩**: `px-8` (데스크톱), `px-6` (태블릿)

### 반응형 브레이크포인트
- **데스크톱** (lg: 1024px+): 3-4열 그리드
- **태블릿** (md: 768px+): 2열 그리드
- **모바일**: 1열 그리드

### Header 구성
- **높이**: `h-16` (64px)
- **배경**: `bg-white border-b border-gray-200`
- **좌측**: 로고 + 네비게이션 메뉴
- **우측**: 알림 + 사용자 드롭다운

## 컴포넌트 규약

### 공통 카드 스타일
```jsx
className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
```

### 색상 시스템
- **Primary**: Blue (`blue-600`, `blue-100`)
- **Success**: Green (`green-600`, `green-100`)
- **Warning**: Yellow (`yellow-400`, `yellow-100`)
- **Error**: Red (`red-600`, `red-100`)
- **Secondary**: Gray (`gray-600`, `gray-100`)

### 통계 카드 (`StatCard`)
```jsx
<StatCard
  title="카드 제목"
  value="12,345"
  change="+12%"
  changeType="positive" // positive, negative, neutral
  icon={<SVGIcon />}
/>
```

### 데이터 테이블 (`DataTable`)
```jsx
<DataTable
  title="테이블 제목"
  data={데이터배열}
  columns={컬럼정의}
  searchableColumns={['name', 'email']} // 검색 가능한 컬럼
  itemsPerPage={10}
  showPagination={true}
  showSearch={true}
/>
```

#### 컬럼 정의 형식
```jsx
const columns = [
  { key: 'name', label: '이름', sortable: true },
  {
    key: 'status',
    label: '상태',
    sortable: true,
    render: (value) => (
      <span className="badge">{value}</span>
    )
  }
]
```

### 배지 스타일
```jsx
// 역할 배지
'bg-purple-100 text-purple-800' // 관리자
'bg-blue-100 text-blue-800'     // 에디터
'bg-gray-100 text-gray-800'     // 사용자

// 상태 배지
'bg-green-100 text-green-800'   // 활성/완료
'bg-red-100 text-red-800'       // 비활성/실패
'bg-yellow-100 text-yellow-800' // 대기/진행중
```

## 인증 시스템

### AuthContext 사용법
```jsx
const { user, isAuthenticated, isLoading, loginWithKakao, logout } = useAuth()
```

### 로그인 플로우
1. 카카오 로그인 버튼 클릭
2. 카카오 OAuth 페이지로 리다이렉트
3. `/auth/kakao/callback`으로 인증코드 반환
4. 백엔드 API로 인증코드 전송
5. JWT 토큰 저장 및 사용자 정보 설정

### 환경 변수
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback
```

## API 구조

### 인증 API 엔드포인트
- `POST /auth/kakao/login` - 카카오 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 사용자 정보 조회

### API 클라이언트 사용법
```jsx
import { authAPI } from '../utils/api'

// 로그인
await authAPI.loginWithKakao(authCode)

// 사용자 정보
const user = await authAPI.getUserInfo()

// 로그아웃
await authAPI.logout()
```

## 개발 가이드라인

### 컴포넌트 작성 규칙
1. 함수형 컴포넌트 + Hooks 사용
2. props 기본값 설정
3. loading, error 상태 처리
4. 적절한 aria-label 설정

### 스타일링 규칙
1. TailwindCSS 유틸리티 클래스만 사용
2. 일관된 간격: `gap-6`, `space-x-4`, `p-6`
3. 호버 효과: `hover:shadow-md`, `hover:bg-gray-50`
4. 트랜지션: `transition-colors`, `transition-shadow`

### 샘플 데이터
프로젝트에는 다음 샘플 데이터가 포함되어 있습니다:
- **사용자 데이터**: 10명의 샘플 사용자 (이름, 이메일, 부서, 역할, 상태)
- **프로젝트 데이터**: 5개의 샘플 프로젝트 (이름, 담당자, 상태, 진행률)
- **활동 데이터**: 5개의 최근 활동 피드
- **할 일 데이터**: 4개의 샘플 작업

## 빌드 및 실행

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 린팅
```bash
npm run lint
```

## 주요 기능

### 대시보드 위젯
- 통계 카드 (증감률 표시)
- 바 차트 (주간/월간 전환)
- 활동 피드 (실시간 업데이트)
- 할 일 목록 (체크박스, 우선순위)

### 데이터 테이블
- 검색 기능 (다중 컬럼)
- 정렬 기능 (오름차순/내림차순)
- 페이지네이션
- 커스텀 렌더링 (배지, 프로그레스 바)

### 인증 기능
- 카카오 OAuth 로그인
- JWT 토큰 관리
- 자동 인증 상태 확인
- 로그인 보호 페이지

이 문서는 프로젝트의 핵심 구조와 개발 가이드라인을 제공합니다. 새로운 기능 추가 시 이 규약을 따라 일관성 있는 코드를 작성하시기 바랍니다.