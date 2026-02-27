import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { createAttendanceWithCode } from '../../services/attendanceService';

const AttendanceCodeModal = ({
    isOpen,
    onClose,
    lecture,
    user,
    onAttendanceSuccess
}) => {
    const [attendanceCode, setAttendanceCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 모달이 열릴 때마다 상태 초기화
    useEffect(() => {
        if (isOpen) {
            setAttendanceCode('');
            setError('');
        }
    }, [isOpen]);

    // 인증코드 변경
    const handleCodeChange = (e) => {
        const value = e.target.value;
        setAttendanceCode(value);
        if (error) {
            setError('');
        }
    };

    // 출석 체크 처리
    const handleSubmit = async () => {
        if (!attendanceCode || attendanceCode.length !== 4) {
            setError('4자리 인증코드를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 출석 인증코드로 출석 생성 API 호출
            const attendanceData = {
                status: 'PRESENT',
                detail_type: 'PRESENT',
                user_id: user.id,
                attendance_code: attendanceCode
            };

            const newAttendance = await createAttendanceWithCode(lecture.id, attendanceData);

            // 성공 콜백 호출
            onAttendanceSuccess(newAttendance);

            // 모달 닫기
            onClose();
        } catch (error) {
            console.error('출석 처리 실패:', error);
            setError(error.message || '출석 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모달 닫기
    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-99 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-xl">
                {/* 헤더 */}
                <div className="border-b border-gray-100 p-6 text-center">
                    <h2 className="text-xl font-bold text-slate-900">출석 체크</h2>
                </div>

                {/* 본문 */}
                <div className="p-6 space-y-4">
                    {/* 강의 정보 */}
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h3 className="font-medium text-blue-900 mb-1">{lecture?.title}</h3>
                        <p className="text-sm text-blue-700">
                            {lecture?.lecture_date && new Date(lecture.lecture_date).toLocaleDateString('ko-KR')}
                        </p>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* 인증코드 입력 */}
                    <div className="text-center">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            출석 인증코드를 입력하세요
                        </label>
                        <input
                            type="text"
                            value={attendanceCode}
                            onChange={handleCodeChange}
                            placeholder="4자리"
                            maxLength="4"
                            className="w-full px-4 py-4 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            강사가 제공한 4자리 인증코드를 입력해주세요
                        </p>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="border-t border-gray-100 p-6">
                    <div className="flex gap-3">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1"
                            disabled={loading}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={loading || !attendanceCode.trim()}
                        >
                            {loading ? '처리 중...' : '출석 확인'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCodeModal;