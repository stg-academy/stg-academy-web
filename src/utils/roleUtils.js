/**
 * 사용자 역할 관리 유틸리티 함수들
 */

// 역할 상수 정의
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
}

// 역할 계층 구조 (높은 권한부터)
export const ROLE_HIERARCHY = [
  ROLES.ADMIN,
  ROLES.USER
]

/**
 * 사용자가 특정 역할을 가지고 있는지 확인
 * @param {Object} user - 사용자 객체
 * @param {string|string[]} requiredRole - 필요한 역할 (배열 허용)
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  if (!user || !user.role) return false

  // 관리자는 모든 권한 보유
  if (user.role === ROLES.ADMIN) return true

  // 배열로 여러 역할 허용 가능
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }

  return user.role === requiredRole
}

/**
 * 사용자가 최소 권한 레벨 이상인지 확인
 * @param {Object} user - 사용자 객체
 * @param {string} minRole - 최소 필요 역할
 * @returns {boolean}
 */
export const hasMinRole = (user, minRole) => {
  if (!user || !user.role) return false

  const userRoleIndex = ROLE_HIERARCHY.indexOf(user.role)
  const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole)

  // 역할이 계층에 없으면 false
  if (userRoleIndex === -1 || minRoleIndex === -1) return false

  // 인덱스가 낮을수록 높은 권한
  return userRoleIndex <= minRoleIndex
}

/**
 * 역할 표시명 반환
 * @param {string|string[]} role - 역할
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: '관리자',
    [ROLES.USER]: '사용자'
  }

  if (Array.isArray(role)) {
    return role.map(r => roleNames[r] || r).join(' 또는 ')
  }

  return roleNames[role] || role
}

/**
 * 관리자인지 확인
 * @param {Object} user - 사용자 객체
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN)
}

/**
 * 일반 사용자인지 확인
 * @param {Object} user - 사용자 객체
 * @returns {boolean}
 */
export const isUser = (user) => {
  return hasRole(user, ROLES.USER)
}

/**
 * 관리자 권한인지 확인 (코스 관리 등)
 * @param {Object} user - 사용자 객체
 * @returns {boolean}
 */
export const canManageContent = (user) => {
  return hasRole(user, ROLES.ADMIN)
}

/**
 * 사용자 관리 권한인지 확인
 * @param {Object} user - 사용자 객체
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return hasRole(user, ROLES.ADMIN)
}

/**
 * 사용자의 접근 가능한 페이지 목록 반환
 * @param {Object} user - 사용자 객체
 * @returns {string[]} 접근 가능한 경로 배열
 */
export const getAccessibleRoutes = (user) => {
  if (!user) return ['/login', '/register']

  const routes = ['/'] // 모든 인증된 사용자는 홈에 접근 가능

  if (isAdmin(user)) {
    routes.push('/courses', '/lectures', '/users')
  }

  return routes
}