import { useState } from 'react'

const ActivityCard = ({ title, activities, loading = false }) => {
  const [showAll, setShowAll] = useState(false)

  const defaultActivities = [
    {
      id: 1,
      user: '김철수',
      action: '새로운 프로젝트를 생성했습니다',
      time: '2분 전',
      avatar: 'KC'
    },
    {
      id: 2,
      user: '이영희',
      action: '보고서를 업로드했습니다',
      time: '15분 전',
      avatar: 'LY'
    },
    {
      id: 3,
      user: '박민수',
      action: '댓글을 작성했습니다',
      time: '1시간 전',
      avatar: 'PM'
    },
    {
      id: 4,
      user: '최지은',
      action: '파일을 공유했습니다',
      time: '2시간 전',
      avatar: 'CJ'
    },
    {
      id: 5,
      user: '정동훈',
      action: '회의 일정을 추가했습니다',
      time: '3시간 전',
      avatar: 'JD'
    }
  ]

  const activityList = activities || defaultActivities
  const displayedActivities = showAll ? activityList : activityList.slice(0, 3)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title || '최근 활동'}</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          전체보기
        </button>
      </div>

      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">{activity.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                <span className="ml-1">{activity.action}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      {activityList.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAll ? '접기' : `${activityList.length - 3}개 더 보기`}
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityCard