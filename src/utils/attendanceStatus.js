// 출석 상태 설정
export const ATTENDANCE_CONFIG = {
  PRESENT: {
    shortName: '출석',
    displayShortName: '출석',
    label: '출석',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    className: 'text-green-700'
  },
  ABSENT: {
    shortName: '결석',
    displayShortName: '결석',
    label: '결석',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    className: 'text-red-700'
  },
  LATE: {
    shortName: '지각',
    displayShortName: '지각',
    label: '지각',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    className: 'text-yellow-700'
  },
  EARLY_LEAVE: {
    shortName: '조퇴',
    displayShortName: '조퇴',
    label: '조퇴',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    className: 'text-orange-700'
  },
  EXCUSED: {
    shortName: '공결',
    displayShortName: '공결',
    label: '공결',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    className: 'text-blue-700'
  },
  None: {
    shortName: '-',
    displayShortName: '-',
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
    label: ATTENDANCE_CONFIG[key].label,
    shortName: ATTENDANCE_CONFIG[key].shortName
  }))
}