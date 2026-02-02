import { useState } from 'react'

const TaskCard = ({ title, tasks, loading = false }) => {
  const [newTask, setNewTask] = useState('')
  const [taskList, setTaskList] = useState(tasks || [
    { id: 1, text: '프로젝트 기획서 작성', completed: false, priority: 'high' },
    { id: 2, text: '클라이언트 미팅 준비', completed: true, priority: 'medium' },
    { id: 3, text: '데이터베이스 설계', completed: false, priority: 'high' },
    { id: 4, text: 'UI 디자인 검토', completed: false, priority: 'low' }
  ])

  const handleToggleTask = (id) => {
    setTaskList(taskList.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTaskList([
        ...taskList,
        {
          id: Date.now(),
          text: newTask,
          completed: false,
          priority: 'medium'
        }
      ])
      setNewTask('')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

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
        <h3 className="text-lg font-semibold text-gray-900">{title || '할 일 목록'}</h3>
        <span className="text-sm text-gray-600">
          {taskList.filter(task => !task.completed).length}개 남음
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {taskList.slice(0, 4).map((task) => (
          <div key={task.id} className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleTask(task.id)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 hover:border-blue-600'
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
            <span className={`flex-1 text-sm ${
              task.completed
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            }`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="새 작업 추가..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAddTask}
          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  )
}

export default TaskCard