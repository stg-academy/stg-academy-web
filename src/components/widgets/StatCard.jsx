import Icon from '../ui/Icon.jsx'

const StatCard = ({ title, value, change, changeType, icon }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <Icon name="trending-up" size={16} />
    } else if (changeType === 'negative') {
      return <Icon name="trending-down" size={16} />
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1 text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard