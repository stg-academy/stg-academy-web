import React from 'react';

/**
 * 강좌 수강 기간 포맷 (YYYY.MM ~ YYYY.MM)
 */
export const formatPeriod = (session) => {
  if (session?.begin_date && session?.end_date) {
    const start = new Date(session.begin_date);
    const end = new Date(session.end_date);
    return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')} ~ ${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}`;
  }
  return '기간 미정';
};

/**
 * 텍스트 내 URL을 외부 링크로 렌더링
 * - 줄바꿈은 whitespace-pre-wrap 으로 처리 (부모 요소에 적용 필요)
 * - 40자 초과 URL은 말줄임 처리, title 속성으로 전체 URL 표시
 *
 * @param {string} text - 렌더링할 텍스트
 * @returns {React.ReactNode[]} 텍스트와 링크 노드 배열
 */
export const renderWithLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  const urlLengthLimit = 35;
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
         className="text-blue-600 underline" title={part}>
        {part.length > urlLengthLimit ? part.slice(0, urlLengthLimit) + '...' : part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

/**
 * 텍스트를 maxLength자로 자르고 말줄임표(...) 추가
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return text;
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * 표/카드처럼 공간이 좁은 곳 전용 — 값 전체가 URL이면 새 탭 링크(잘린 라벨 + title에 전체 URL),
 * 아니면 maxLength자로 자른 텍스트(title에 전체 텍스트)를 렌더링.
 * 문단 중간에 섞인 URL을 부분적으로 링크화하는 renderWithLinks와 달리, 값 전체가 URL인 경우만 링크로 처리한다.
 * @param {string} text
 * @param {number} maxLength
 * @returns {React.ReactNode}
 */
export const renderTruncatedCell = (text, maxLength = 30) => {
  if (!text) return '-';
  const trimmed = text.trim();
  const isUrl = /^https?:\/\/\S+$/.test(trimmed);
  const label = truncateText(trimmed, maxLength);
  if (isUrl) {
    return (
      <a href={trimmed} target="_blank" rel="noopener noreferrer"
         className="text-blue-600 underline" title={trimmed}>
        {label}
      </a>
    );
  }
  return <span title={trimmed}>{label}</span>;
};
