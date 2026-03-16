import React from 'react';

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
