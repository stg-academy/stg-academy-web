/**
 * 전화번호 유틸리티 함수들
 */

/**
 * 숫자만 남은 전화번호를 하이픈 형식으로 변환
 * 예: 01012341234 -> 010-1234-1234, 0212345678 -> 021-234-5678
 * @param {string} value - 입력된 전화번호
 * @returns {string} 하이픈이 포함된 전화번호
 */
export const formatPhoneNumber = (value) => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

/**
 * 휴대폰 번호 형식(010-1234-5678)이 올바른지 검증
 * @param {string} value - 검증할 전화번호
 * @returns {boolean} 형식 유효 여부
 */
export const isValidPhoneNumber = (value) => {
  return /^01[0-9]-\d{3,4}-\d{4}$/.test((value || '').trim())
}
