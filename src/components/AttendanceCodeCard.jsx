import React, { useState } from 'react';

const AttendanceCodeCard = ({ attendanceCode, onRefreshCode }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    // 출석 코드 복사
    const handleCopyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopySuccess(true);
            // 2초 후 원래 아이콘으로 복원
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
            // Fallback: 텍스트 선택 방식
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (fallbackErr) {
                console.error('Fallback 복사도 실패:', fallbackErr);
                alert('복사에 실패했습니다. 수동으로 복사해주세요.');
            }
            document.body.removeChild(textArea);
        }
    };

    // 출석 코드 새로고침
    const handleRefreshCode = () => {
        if (onRefreshCode) {
            onRefreshCode();
        } else {
            // TODO: API 호출로 새로운 출석 코드 생성
            console.log('출석 코드 새로고침 - 추후 개발 예정');
        }
    };

    if (!attendanceCode) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-medium text-slate-500">출석 인증코드</h3>
                        <div className="text-lg font-semibold text-slate-700 tracking-wider">
                            {attendanceCode}
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {/* 복사 버튼 */}
                        <button
                            onClick={() => handleCopyCode(attendanceCode)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors group"
                            title="코드 복사"
                        >
                            {copySuccess ? (
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                        {/* 새로고침 버튼 */}
                        <button
                            onClick={handleRefreshCode}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors group"
                            title="코드 새로고침"
                            disabled={!onRefreshCode}
                        >
                            <svg className={`w-4 h-4 ${onRefreshCode ? 'text-slate-600 group-hover:text-slate-800' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCodeCard;