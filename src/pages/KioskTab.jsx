import React from 'react';
import { useNavigate } from 'react-router-dom';

const KioskTab = ({ sessionId, todaysLecture }) => {
    const navigate = useNavigate();

    // 현장 출석체크로 이동
    const handleKioskAttendance = () => {
        navigate(`/sessions/${sessionId}/attendance/kiosk`);
    };

    return (
        <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">현장 출석체크</h3>

                {todaysLecture ? (
                    <div className="mb-6">
                        <div className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            오늘 진행 강의 있음
                        </div>
                        <p className="text-gray-600 mb-2">
                            <strong>{todaysLecture.title}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            {new Date(todaysLecture.lecture_date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long'
                            })}
                        </p>
                        <button
                            onClick={handleKioskAttendance}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            현장 출석체크 시작
                        </button>
                    </div>
                ) : (
                    <div className="mb-6">
                        <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            오늘 진행 강의 없음
                        </div>
                        <p className="text-gray-500 mb-6">오늘 예정된 강의가 없어 현장 출석체크를 사용할 수 없습니다.</p>
                        <button
                            disabled
                            className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            현장 출석체크 시작
                        </button>
                    </div>
                )}

                <div className="text-left bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">현장 출석체크 안내</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 수강생들이 직접 이름을 검색하여 출석체크할 수 있습니다</li>
                        <li>• 한글 초성 검색이 가능하여 빠른 검색이 가능합니다</li>
                        <li>• 터치스크린에 최적화된 큰 버튼으로 구성되어 있습니다</li>
                        <li>• 실시간으로 출석 현황을 확인할 수 있습니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default KioskTab;