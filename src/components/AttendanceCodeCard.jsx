import React, { useState } from 'react';
import { useToast } from './ui/ToastProvider.jsx';
import Icon from './ui/Icon.jsx';

const AttendanceCodeCard = ({ attendanceCode, onRefreshCode }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const toast = useToast();

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
                toast.error('복사에 실패했습니다. 수동으로 복사해주세요.');
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
                                <Icon name="check" size={16} className="text-slate-600" />
                            ) : (
                                <Icon name="copy" size={16} className="text-slate-600 group-hover:text-slate-800" />
                            )}
                        </button>
                        {/* 새로고침 버튼 */}
                        <button
                            onClick={handleRefreshCode}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors group"
                            title="코드 새로고침"
                            disabled={!onRefreshCode}
                        >
                            <Icon name="refresh-cw" size={16} className={onRefreshCode ? 'text-slate-600 group-hover:text-slate-800' : 'text-slate-400'} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCodeCard;