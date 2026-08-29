import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import StatCard from '../components/widgets/StatCard'
import ChartCard from '../components/widgets/ChartCard'
import ActivityCard from '../components/widgets/ActivityCard'
import TaskCard from '../components/widgets/TaskCard'
import Icon from '../components/ui/Icon.jsx'

const SampleDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 시뮬레이션된 로딩
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // 에러 상태 시뮬레이션 (테스트용)
  const simulateError = () => {
    setError('데이터를 불러오는 중 오류가 발생했습니다.')
    setTimeout(() => setError(null), 3000)
  }

  // 통계 데이터
  const stats = [
    {
      title: '총 사용자',
      value: '12,345',
      change: '+12%',
      changeType: 'positive',
      icon: <Icon name="users" size={32} />
    },
    {
      title: '월간 매출',
      value: '₩45.2M',
      change: '+8.2%',
      changeType: 'positive',
      icon: <Icon name="dollar-sign" size={32} />
    },
    {
      title: '주문 수',
      value: '2,847',
      change: '-3.1%',
      changeType: 'negative',
      icon: <Icon name="shopping-cart" size={32} />
    },
    {
      title: '전환율',
      value: '3.24%',
      change: '+0.5%',
      changeType: 'positive',
      icon: <Icon name="percent" size={32} />
    }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Icon name="alert-triangle" size={24} className="text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-red-900 mb-2">오류 발생</h3>
            <p className="text-sm sm:text-base text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              새로고침
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {/* 페이지 헤더 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                안녕하세요, {user?.username || '사용자'}님! 👋
              </h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">샘플 대시보드 페이지입니다. 실시간 현황을 확인해보세요.</p>
            </div>
            <button
              onClick={simulateError}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex-shrink-0"
            >
              에러 테스트
            </button>
          </div>
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <ChartCard
              title="방문자 통계"
              subtitle="최근 7일간 일별 방문자 수"
              loading={loading}
            />
          </div>
          <div>
            <ActivityCard
              title="최근 활동"
              loading={loading}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <TaskCard
              title="오늘의 할일"
              loading={loading}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <ChartCard
              title="매출 추이"
              subtitle="월별 매출 현황"
              data={[
                { label: '1월', value: 120 },
                { label: '2월', value: 150 },
                { label: '3월', value: 130 },
                { label: '4월', value: 180 },
                { label: '5월', value: 200 },
                { label: '6월', value: 170 }
              ]}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SampleDashboard