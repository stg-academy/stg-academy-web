import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Button } from '../components/mobile/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { getEnrollsByUser } from '../services/enrollService';
import { getLecturesBySession } from '../services/lectureService';
import { createAttendance, getAttendancesByLecture } from '../services/attendanceService';

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
  const [checkedIn, setCheckedIn] = useState(false);
  const [todaysLectures, setTodaysLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedInLecture, setCheckedInLecture] = useState(null);
  const [lectureAttendances, setLectureAttendances] = useState({});

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
          // 강의별 출석 기록 조회
          const attendances = await getAttendancesByLecture(lecture.id);
          const userAttendance = Array.isArray(attendances)
            ? attendances.find(att => att.user_id === user.id)
            : null;

          attendanceMap[lecture.id] = userAttendance;
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

  const handleCheckIn = async (lecture) => {
    // 이미 출석 기록이 있는 경우 처리 중단
    if (lectureAttendances[lecture.id]) {
      alert('이미 출석 처리된 강의입니다.');
      return;
    }

    setCheckingIn(true);

    try {
      // 출석 생성 API 호출
      const attendanceData = {
        user_id: user.id,
        status: 'PRESENT',
        detail_type: 'PRESENT'
      };

      const newAttendance = await createAttendance(lecture.id, attendanceData);

      // 출석 기록 업데이트
      setLectureAttendances(prev => ({
        ...prev,
        [lecture.id]: newAttendance
      }));

      setCheckedInLecture(lecture);
      setCheckedIn(true);
      alert('출석이 완료되었습니다!');
    } catch (error) {
      console.error('출석 처리 실패:', error);
      alert('출석 처리 중 오류가 발생했습니다.');
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
    if (!attendance) return { text: '출석 안함', color: 'text-slate-500' };

    switch (attendance.status) {
      case 'PRESENT':
        return { text: '출석', color: 'text-green-600' };
      case 'ABSENT':
        return { text: '결석', color: 'text-red-600' };
      case 'LATE':
        return { text: '지각', color: 'text-orange-600' };
      case 'EXCUSED':
        return { text: '사유결석', color: 'text-blue-600' };
      default:
        return { text: '미확인', color: 'text-slate-500' };
    }
  };

  if (!user) {
    return (
      <MobileLayout headerTitle="출석">
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">출석 체크를 시작하세요</h2>
              <p className="text-sm text-slate-500 mb-6">로그인하여 강의 출석을 체크하고 관리해보세요</p>
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

  if (loading) {
    return (
      <MobileLayout headerTitle="출석">
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (checkedIn && checkedInLecture) {
    return (
      <MobileLayout headerTitle="출석">
        <div className="h-full flex flex-col items-center justify-center p-6 space-y-6 pt-20">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2Icon className="h-12 w-12 text-green-600" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">출석 완료!</h2>
            <p className="text-slate-500">
              {checkedInLecture.sessionTitle}<br/>
              {checkedInLecture.lecture_date ? formatDate(checkedInLecture.lecture_date) : ''} {formatTime(new Date())}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => {
              setCheckedIn(false);
              setCheckedInLecture(null);
            }}
          >
            돌아가기
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout headerTitle="출석">
      <div className="p-5 space-y-6">

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">오늘의 강의</h2>

          {todaysLectures.length > 0 ? (
            todaysLectures.map((lecture) => {
              const attendance = lectureAttendances[lecture.id];
              const attendanceStatus = getAttendanceStatus(attendance);
              const isAlreadyChecked = !!attendance;

              return (
                <Card key={lecture.id} className={`mb-3 ${isAlreadyChecked ? 'border-green-100 bg-green-50/50' : 'border-blue-100 bg-blue-50/50'}`}>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-900 text-lg flex-1 min-w-0 mr-3 truncate">{lecture.sessionTitle}</h3>
                        <span className={`text-sm font-semibold flex-shrink-0 ${attendanceStatus.color}`}>
                          {attendanceStatus.text}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate">
                        {lecture.title} - {lecture.lecture_date ? formatDate(lecture.lecture_date) : '날짜 미정'}
                      </p>
                    </div>

                    <Button
                      className={`w-full h-14 text-lg font-semibold shadow-lg ${
                        isAlreadyChecked
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-green-200'
                          : 'shadow-blue-200'
                      }`}
                      onClick={() => handleCheckIn(lecture)}
                      disabled={checkingIn || isAlreadyChecked}
                      variant={isAlreadyChecked ? 'outline' : 'default'}
                    >
                      <MapPinIcon className="mr-2 h-5 w-5" />
                      {checkingIn ? '출석 처리 중...' : isAlreadyChecked ? '출석 완료' : '출석 체크하기'}
                    </Button>
                    <p className="text-xs text-center text-slate-400">
                      {isAlreadyChecked
                        ? `* ${attendance?.created_at ? formatTime(attendance.created_at) : ''}에 출석 처리되었습니다.`
                        : '* 강의 시간에만 출석이 가능합니다.'
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-6 text-center">
                <p className="text-slate-500">오늘 예정된 강의가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </section>

      </div>
    </MobileLayout>
  );
}