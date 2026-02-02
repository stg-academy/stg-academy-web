import { useState } from 'react'

const ChartCard = ({ title, subtitle, data, loading = false }) => {
  const [activeTab, setActiveTab] = useState('week')

  // 간단한 바 차트 시뮬레이션 데이터
  const chartData = data || [
    { label: '월', value: 75 },
    { label: '화', value: 85 },
    { label: '수', value: 65 },
    { label: '목', value: 90 },
    { label: '금', value: 80 },
    { label: '토', value: 70 },
    { label: '일', value: 60 }
  ]

  const maxValue = Math.max(...chartData.map(item => item.value))

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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* 간단한 바 차트 */}
      <div className="flex items-end space-x-2 h-24">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            ></div>
            <span className="text-xs text-gray-600 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartCard