import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { useAuth } from '../contexts/AuthContext';
import { getEnrollsByUser } from '../services/enrollService';
import { getLecturesBySession } from '../services/lectureService';
import { createOrUpdateAttendance, createAttendanceWithCode, getMyAttendanceByLecture } from '../services/attendanceService';
import { ATTENDANCE_CONFIG, getAttendanceStyle } from '../utils/attendanceStatus';

const QrCodeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CheckCircle2Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function Attendance() {
  const { user } = useAuth();
  const toast = useToast();
  const [checkedIn, setCheckedIn] = useState(false);
  const [todaysLectures, setTodaysLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedInLecture, setCheckedInLecture] = useState(null);
  const [lectureAttendances, setLectureAttendances] = useState({});
  const [showCodeInput, setShowCodeInput] = useState({});
  const [attendanceCodes, setAttendanceCodes] = useState({});
  const [codeError, setCodeError] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchTodaysLectures();
    }
  }, [user?.id]);

  const fetchTodaysLectures = async () => {
    try {
      setLoading(true);

      // 사용자의 수강 신청 목록 조회
      const enrollments = await getEnrollsByUser(user.id);
      const activeEnrollments = Array.isArray(enrollments)
        ? enrollments.filter(e => e.enroll_status === 'ENROLLED' || e.enroll_status === 'ACTIVE')
        : [];

      // 오늘 날짜
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const todaysLecturesList = [];

      // 각 수강 강좌의 오늘 강의 조회
      for (const enrollment of activeEnrollments) {
        try {
          const lectures = await getLecturesBySession(enrollment.session_id);
          const todaysSessionLectures = Array.isArray(lectures)
            ? lectures.filter(lecture => {
                if (lecture.lecture_date) {
                  const lectureDate = new Date(lecture.lecture_date).toISOString().split('T')[0];
                  return lectureDate === todayString;
                }
                return false;
              })
            : [];

          todaysSessionLectures.forEach(lecture => {
            todaysLecturesList.push({
              ...lecture,
              sessionTitle: enrollment.session_title || enrollment.session?.title,
              sessionId: enrollment.session_id
            });
          });
        } catch (err) {
          console.error(`세션 ${enrollment.session_id}의 강의 조회 실패:`, err);
        }
      }

      setTodaysLectures(todaysLecturesList);

      // 각 강의의 출석 기록 확인
      await checkAttendanceStatus(todaysLecturesList);
    } catch (error) {
      console.error('오늘의 강의 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAttendanceStatus = async (lectures) => {
    try {
      const attendanceMap = {};

      for (const lecture of lectures) {
        try {
          // 나의 강의 출석 기록 조회
          attendanceMap[lecture.id] = await getMyAttendanceByLecture(lecture.id);
        } catch (err) {
          console.error(`강의 ${lecture.id}의 출석 기록 조회 실패:`, err);
          attendanceMap[lecture.id] = null;
        }
      }

      setLectureAttendances(attendanceMap);
    } catch (error) {
      console.error('출석 상태 확인 실패:', error);
    }
  };

  // 인증코드 입력 화면 표시
  const handleShowCodeInput = (lecture) => {
    // 이미 출석 기록이 있는 경우 처리 중단
    if (lectureAttendances[lecture.id]) {
      toast.warning('이미 출석 처리된 강의입니다.');
      return;
    }
    setShowCodeInput(prev => ({ ...prev, [lecture.id]: true }));
    setCodeError(prev => ({ ...prev, [lecture.id]: '' }));
  };

  // 인증코드 입력 취소
  const handleCancelCodeInput = (lectureId) => {
    setShowCodeInput(prev => ({ ...prev, [lectureId]: false }));
    setAttendanceCodes(prev => ({ ...prev, [lectureId]: '' }));
    setCodeError(prev => ({ ...prev, [lectureId]: '' }));
  };

  // 인증코드 변경
  const handleCodeChange = (lectureId, code) => {
    setAttendanceCodes(prev => ({ ...prev, [lectureId]: code }));
    if (codeError[lectureId]) {
      setCodeError(prev => ({ ...prev, [lectureId]: '' }));
    }
  };

  // 인증코드로 출석 체크
  const handleCheckInWithCode = async (lecture) => {
    const code = attendanceCodes[lecture.id];
    if (!code || code.length !== 4) {
      setCodeError(prev => ({ ...prev, [lecture.id]: '4자리 인증코드를 입력해주세요.' }));
      return;
    }

    setCheckingIn(true);
    try {
      // 출석 인증코드로 출석 생성 API 호출
      const attendanceData = {
        status: 'PRESENT',
        detail_type: 'PRESENT',
        user_id: user.id,
        attendance_code: code
      };

      const newAttendance = await createAttendanceWithCode(lecture.id, attendanceData);

      // 출석 기록 업데이트
      setLectureAttendances(prev => ({
        ...prev,
        [lecture.id]: newAttendance
      }));

      setCheckedInLecture(lecture);
      setCheckedIn(true);
      setShowCodeInput(prev => ({ ...prev, [lecture.id]: false }));
      setAttendanceCodes(prev => ({ ...prev, [lecture.id]: '' }));
      toast.success('출석이 완료되었습니다!');
    } catch (error) {
      console.error('출석 처리 실패:', error);
      setCodeError(prev => ({ ...prev, [lecture.id]: error.message || '출석 처리 중 오류가 발생했습니다.' }));
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) {
      return ATTENDANCE_CONFIG['None'];
    }

    const detailType = attendance.detail_type || 'None'
    return ATTENDANCE_CONFIG[detailType]
  };

  if (loading) {
    return (
        <MobileLayout headerTitle="출석">
          <div className="p-5 flex justify-center items-center h-64">
            <div className="text-neutral-500">로딩 중...</div>
          </div>
        </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout headerTitle="출석">
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">출석 체크를 시작하세요</h2>
              <p className="text-sm text-neutral-500 mb-6">로그인하여 강의 출석을 체크하고 관리해보세요</p>
              <Link to="/login">
                <Button className="w-full max-w-xs">
                  로그인하여 시작하기
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout headerTitle="출석">
      <div className="p-5 space-y-6">

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-4">오늘의 강의</h2>

          {todaysLectures.length > 0 ? (
            todaysLectures.map((lecture) => {
              const attendance = lectureAttendances[lecture.id];
              const attendanceStatus = getAttendanceStatus(attendance);
              const isAlreadyChecked = !!attendance;

              return (
                <Card key={lecture.id} className={`mb-3 bg-white space-y-4 ${isAlreadyChecked ? 'border-success/20 ' : 'border-accent/20'} `}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-neutral-900 text-lg flex-1 min-w-0 mr-3 truncate">{lecture.sessionTitle}</h3>
                        {/* 출석 상태별 색상은 attendanceStatus.js의 별도 색상 체계를 그대로 사용 (v2 토큰 범위 밖) */}
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${attendanceStatus.className} ${attendanceStatus.bgColor} ${attendanceStatus.borderColor}`}>
                          {attendanceStatus.label}
                        </span>
                      </div>
                      <p className="text-neutral-600 truncate">
                        {lecture.title} - {lecture.lecture_date ? formatDate(lecture.lecture_date) : '날짜 미정'}
                      </p>
                    </div>

                    {showCodeInput[lecture.id] ? (
                      // 인증코드 입력 UI
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-sm font-medium text-neutral-700 mb-2">출석 인증코드를 입력하세요</p>
                          <input
                            type="text"
                            value={attendanceCodes[lecture.id] || ''}
                            onChange={(e) => handleCodeChange(lecture.id, e.target.value)}
                            placeholder="4자리 코드"
                            maxLength="4"
                            className="w-full px-3 py-2 text-center text-lg font-bold border border-neutral-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent"
                          />
                          {codeError[lecture.id] && (
                            <p className="text-xs text-error mt-1">{codeError[lecture.id]}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCancelCodeInput(lecture.id)}
                            variant="secondary"
                            className="flex-1"
                            disabled={checkingIn}
                          >
                            취소
                          </Button>
                          <Button
                            onClick={() => handleCheckInWithCode(lecture)}
                            className="flex-1"
                            disabled={checkingIn || !attendanceCodes[lecture.id]?.trim()}
                          >
                            {checkingIn ? '처리 중...' : '출석 확인'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 기본 출석 버튼
                      <Button
                        className={`w-full h-14 text-lg font-semibold ${
                          isAlreadyChecked
                            ? `${attendanceStatus.bgColor} ${attendanceStatus.className} hover:opacity-80 border ${attendanceStatus.borderColor}`
                            : ''
                        }`}
                        onClick={() => handleShowCodeInput(lecture)}
                        disabled={checkingIn || isAlreadyChecked}
                        variant={isAlreadyChecked ? 'secondary' : 'primary'}
                      >
                        <MapPinIcon className="mr-2 h-5 w-5" />
                        {isAlreadyChecked ? '출석 완료' : '출석 체크하기'}
                      </Button>
                    )}
                    <p className="text-xs text-center text-neutral-400">
                      {isAlreadyChecked
                        ? `* ${attendance?.created_at ? formatTime(attendance.created_at) : ''}에 출석 처리되었습니다.`
                        : '* 강의 시간에만 출석이 가능합니다.'
                      }
                    </p>
                </Card>
              );
            })
          ) : (
            <Card>
              <p className="text-neutral-500 text-center">오늘 예정된 강의가 없습니다.</p>
            </Card>
          )}
        </section>

      </div>
    </MobileLayout>
  );
}