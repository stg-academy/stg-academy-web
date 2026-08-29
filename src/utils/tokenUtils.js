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
 * 토큰에서 로그인 방식(login_method 클레임) 추출
 * @param {string} token - JWT 토큰
 * @returns {string|null} 로그인 방식 ('normal', 'kakao', 'phone' 등) 또는 null
 */
export const getLoginMethodFromToken = (token) => {
  const payload = decodeToken(token)
  return payload?.login_method || null
}