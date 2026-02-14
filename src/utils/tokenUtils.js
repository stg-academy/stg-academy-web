/**
 * JWT 토큰 유틸리티 함수들
 */

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코딩된 페이로드 또는 null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))

    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('토큰 디코딩 실패:', error)
    return null
  }
}

/**
 * 토큰이 임시 토큰인지 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 임시 토큰 여부
 */
export const isTemporaryToken = (token) => {
  const payload = decodeToken(token)
  if (!payload) return false

  console.log('토큰 검사:', payload) // 디버깅용

  // 임시 토큰은 kakao_user 필드가 있거나 registration_complete가 false인 경우
  // 정식 토큰은 sub만 있고 kakao_user 필드가 없음
  const hasKakaoUser = !!payload.kakao_user
  const isIncomplete = payload.registration_complete === false
  const isTemp = hasKakaoUser || isIncomplete

  console.log('kakao_user 존재:', hasKakaoUser) // 디버깅용
  console.log('registration_complete:', payload.registration_complete) // 디버깅용
  console.log('임시 토큰 여부:', isTemp) // 디버깅용

  return isTemp
}

/**
 * 토큰이 만료되었는지 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 만료 여부
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * 토큰에서 사용자 정보 추출
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 사용자 정보 또는 null
 */
export const getUserFromToken = (token) => {
  const payload = decodeToken(token)
  if (!payload) return null

  // kakao_user 객체가 있는 경우 (카카오 임시 토큰)
  if (payload.kakao_user) {
    return {
      id: payload.kakao_user.kakao_id,
      username: payload.kakao_user.nickname,
    }
  }

  // 일반적인 JWT 구조인 경우
  return {
    id: payload.sub || payload.user_id,
    username: payload.username || payload.name || payload.nickname,
    email: payload.email,
    role: payload.role,
    registration_complete: payload.registration_complete
  }
}