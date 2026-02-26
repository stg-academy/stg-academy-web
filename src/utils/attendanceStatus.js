// 출석 상태 설정
export const ATTENDANCE_CONFIG = {
  PRESENT: {
    label: '출석',
    status: 'PRESENT',
    detail_type: 'PRESENT',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    className: 'text-green-700'
  },
  ASSIGNMENT: {
    label: '과제물 제출',
    status: 'PRESENT',
    detail_type: 'ASSIGNMENT',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    className: 'text-blue-700'
  },
  ALTERNATIVE: {
    label: '교차수강',
    status: 'PRESENT',
    detail_type: 'ALTERNATIVE',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    className: 'text-blue-700'
  },
  ABSENT: {
    label: '결석',
    status: 'ABSENT',
    detail_type: 'ABSENT',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    className: 'text-red-700'
  },
  None: {
    label: '미입력',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    className: 'text-gray-500'
  }
}

/**
 * 출석 상태에 따른 스타일 반환
 * @param {string} status - 출석 상태
 * @returns {Object} 스타일 객체
 */
export const getAttendanceStyle = (status) => {
  const config = ATTENDANCE_CONFIG[status] || ATTENDANCE_CONFIG.None
  return {
    className: config.className,
    bgClassName: config.bgColor,
    borderClassName: config.borderColor
  }
}

/**
 * 출석 상태에 따른 툴팁 텍스트 반환
 * @param {Object} attendance - 출석 객체
 * @returns {string} 툴팁 텍스트
 */
export const getAttendanceTooltip = (attendance) => {
  if (!attendance) return '클릭하여 출석 상태를 설정하세요'

  const config = ATTENDANCE_CONFIG[attendance.status] || ATTENDANCE_CONFIG.None
  let tooltip = `상태: ${config.label}`

  if (attendance.note) {
    tooltip += `\n비고: ${attendance.note}`
  }

  return tooltip + '\n클릭하여 수정'
}

/**
 * 출석 상태 옵션 목록 반환
 * @returns {Array} 출석 상태 옵션 배열
 */
export const getAttendanceOptions = () => {
  return Object.keys(ATTENDANCE_CONFIG).filter(key => key !== 'None').map(key => ({
    value: key,
    label: ATTENDANCE_CONFIG[key].label
  }))
}