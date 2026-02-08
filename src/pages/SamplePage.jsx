import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import DataTable from '../components/widgets/DataTable'
import StatCard from '../components/widgets/StatCard'
import IconCollection from '../components/widgets/IconCollection'

const SamplePage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // 시뮬레이션된 로딩
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // 샘플 테이블 데이터
  const usersData = [
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      role: '관리자',
      status: '활성',
      lastLogin: '2024-01-15',
      department: '개발팀'
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      role: '사용자',
      status: '활성',
      lastLogin: '2024-01-14',
      department: '마케팅팀'
    },
    {
      id: 3,
      name: '박민수',
      email: 'park@example.com',
      role: '에디터',
      status: '비활성',
      lastLogin: '2024-01-10',
      department: '디자인팀'
    },
    {
      id: 4,
      name: '최지은',
      email: 'choi@example.com',
      role: '사용자',
      status: '활성',
      lastLogin: '2024-01-13',
      department: '개발팀'
    },
    {
      id: 5,
      name: '정동훈',
      email: 'jung@example.com',
      role: '관리자',
      status: '활성',
      lastLogin: '2024-01-15',
      department: '운영팀'
    },
    {
      id: 6,
      name: '강수연',
      email: 'kang@example.com',
      role: '사용자',
      status: '대기',
      lastLogin: '2024-01-12',
      department: '마케팅팀'
    },
    {
      id: 7,
      name: '윤상호',
      email: 'yoon@example.com',
      role: '에디터',
      status: '활성',
      lastLogin: '2024-01-14',
      department: '콘텐츠팀'
    },
    {
      id: 8,
      name: '임미래',
      email: 'lim@example.com',
      role: '사용자',
      status: '활성',
      lastLogin: '2024-01-15',
      department: '디자인팀'
    },
    {
      id: 9,
      name: '한지민',
      email: 'han@example.com',
      role: '에디터',
      status: '활성',
      lastLogin: '2024-01-14',
      department: '콘텐츠팀'
    },
    {
      id: 10,
      name: '송민호',
      email: 'song@example.com',
      role: '사용자',
      status: '비활성',
      lastLogin: '2024-01-08',
      department: '마케팅팀'
    }
  ]

  // 프로젝트 데이터
  const projectsData = [
    {
      id: 1,
      name: 'STG Academy 웹사이트 리뉴얼',
      manager: '김철수',
      status: '진행중',
      progress: 75,
      deadline: '2024-02-15',
      priority: '높음'
    },
    {
      id: 2,
      name: '모바일 앱 개발',
      manager: '이영희',
      status: '대기',
      progress: 0,
      deadline: '2024-03-01',
      priority: '중간'
    },
    {
      id: 3,
      name: 'API 서버 업그레이드',
      manager: '박민수',
      status: '완료',
      progress: 100,
      deadline: '2024-01-10',
      priority: '높음'
    },
    {
      id: 4,
      name: 'UI/UX 디자인 가이드',
      manager: '최지은',
      status: '진행중',
      progress: 45,
      deadline: '2024-01-30',
      priority: '낮음'
    },
    {
      id: 5,
      name: '데이터베이스 마이그레이션',
      manager: '정동훈',
      status: '진행중',
      progress: 60,
      deadline: '2024-02-05',
      priority: '높음'
    }
  ]

  // 사용자 테이블 컬럼
  const userColumns = [
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    { key: 'department', label: '부서', sortable: true },
    {
      key: 'role',
      label: '역할',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === '관리자'
            ? 'bg-purple-100 text-purple-800'
            : value === '에디터'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === '활성'
            ? 'bg-green-100 text-green-800'
            : value === '비활성'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'lastLogin', label: '최근 로그인', sortable: true }
  ]

  // 프로젝트 테이블 컬럼
  const projectColumns = [
    { key: 'name', label: '프로젝트명', sortable: true },
    { key: 'manager', label: '담당자', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === '완료'
            ? 'bg-green-100 text-green-800'
            : value === '진행중'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'progress',
      label: '진행률',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 w-10">{value}%</span>
        </div>
      )
    },
    {
      key: 'priority',
      label: '우선순위',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === '높음'
            ? 'bg-red-100 text-red-800'
            : value === '중간'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'deadline', label: '마감일', sortable: true }
  ]

  // 통계 카드 데이터
  const stats = [
    {
      title: '총 사용자',
      value: usersData.length.toString(),
      change: '+2명',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: '진행중 프로젝트',
      value: projectsData.filter(p => p.status === '진행중').length.toString(),
      change: '+1개',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 md:px-6 py-6">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">샘플 페이지</h2>
          <p className="text-gray-600 mt-1">
            안녕하세요, {user?.username || '사용자'}님! 다양한 데이터 테이블과 통계를 확인할 수 있습니다.
          </p>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* 아이콘 모음집 섹션 */}
        <div className="mb-8">
          <IconCollection
            title="아이콘 모음집"
            className="min-h-[600px]"
          />
        </div>

        {/* 테이블 섹션 */}
        <div className="space-y-8">
          {/* 사용자 관리 테이블 */}
          <DataTable
            title="사용자 관리"
            data={usersData}
            columns={userColumns}
            searchableColumns={['name', 'email', 'department']}
            loading={loading}
            itemsPerPage={7}
            showPagination={true}
            showSearch={true}
            emptyMessage="등록된 사용자가 없습니다."
            className="min-h-[400px]"
          />

          {/* 프로젝트 관리 테이블 */}
          <DataTable
            title="프로젝트 관리"
            data={projectsData}
            columns={projectColumns}
            searchableColumns={['name', 'manager']}
            loading={loading}
            itemsPerPage={5}
            showPagination={true}
            showSearch={true}
            emptyMessage="진행중인 프로젝트가 없습니다."
            className="min-h-[350px]"
          />
        </div>
      </main>
    </div>
  )
}

export default SamplePage