import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Button } from '../components/mobile/ui/button';
import { Badge } from '../components/mobile/ui/badge';
import { Progress } from '../components/mobile/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { getLecturesBySession } from '../services/lectureService';
import { getAttendancesBySession, createOrUpdateAttendance } from '../services/attendanceService';

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default function SessionDetail() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    if (sessionId && user?.id) {
      fetchSessionData();
    } else {
      setLoading(false);
    }
  }, [sessionId, user?.id]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 세션의 강의 목록과 출석 기록을 병렬로 조회
      const [lecturesData, attendancesData] = await Promise.all([
        getLecturesBySession(sessionId),
        getAttendancesBySession(sessionId)
      ]);

      setLectures(Array.isArray(lecturesData) ? lecturesData : []);
      setAttendances(Array.isArray(attendancesData) ? attendancesData : []);

      // 첫 번째 강의에서 세션 정보 추출 (임시)
      if (lecturesData && lecturesData.length > 0) {
        setSessionInfo({
          title: lecturesData[0].session?.title || '강의명 없음',
          description: lecturesData[0].session?.description || '',
        });
      }

    } catch (error) {
      console.error('세션 데이터 조회 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getUserAttendanceForLecture = (lectureId) => {
    return attendances.find(att =>
      att.lecture_id === lectureId && att.user_id === user.id
    );
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) {
      return {
        text: '미체크',
        color: 'text-slate-500',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        icon: <ClockIcon className="h-4 w-4" />
      };
    }

    switch (attendance.status) {
      case 'PRESENT':
        return {
          text: '출석',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircleIcon className="h-4 w-4" />
        };
      case 'ABSENT':
        return {
          text: '결석',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <XCircleIcon className="h-4 w-4" />
        };
      case 'LATE':
        return {
          text: '지각',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <ClockIcon className="h-4 w-4" />
        };
      case 'EXCUSED':
        return {
          text: '사유결석',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <ClockIcon className="h-4 w-4" />
        };
      default:
        return {
          text: '미확인',
          color: 'text-slate-500',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          icon: <ClockIcon className="h-4 w-4" />
        };
    }
  };

  const calculateAttendanceStats = () => {
    const totalLectures = lectures.length;
    const userAttendances = attendances.filter(att => att.user_id === user.id);
    const presentCount = userAttendances.filter(att => att.status === 'PRESENT').length;

    return {
      totalLectures,
      presentCount,
      attendanceRate: totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0
    };
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const lectureDate = new Date(dateString);

    return today.getFullYear() === lectureDate.getFullYear() &&
           today.getMonth() === lectureDate.getMonth() &&
           today.getDate() === lectureDate.getDate();
  };

  const canCheckAttendance = (lecture) => {
    const attendance = getUserAttendanceForLecture(lecture.id);
    return isToday(lecture.lecture_date) && !attendance;
  };

  const handleCheckIn = async (lecture) => {
    setCheckingIn(lecture.id);

    try {
      // 출석 생성/수정 API 호출
      const newAttendance = await createOrUpdateAttendance(
        lecture.id,
        user.id,
        'PRESENT'
      );

      // 출석 기록 업데이트
      setAttendances(prev => [...prev, newAttendance]);

      alert('출석이 완료되었습니다!');
    } catch (error) {
      console.error('출석 처리 실패:', error);
      alert('출석 처리 중 오류가 발생했습니다.');
    } finally {
      setCheckingIn(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <MobileLayout headerTitle="강의 상세" showBack={true}>
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-sm text-slate-500 mb-6">강의 정보를 확인하려면 로그인해주세요</p>
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
      <MobileLayout headerTitle="강의 상세" showBack={true}>
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout headerTitle="강의 상세" showBack={true}>
        <div className="p-5 space-y-4">
          <Card className="border-red-100">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={fetchSessionData}
                className="mt-4"
                variant="outline"
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const stats = calculateAttendanceStats();

  return (
    <MobileLayout headerTitle={sessionInfo?.title || "강의 상세"} showBack={true}>
      <div className="p-5 space-y-6">

        {/* 강의 정보 헤더 */}
        <section>
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-5 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-2 truncate">
                  {sessionInfo?.title || '강의명 없음'}
                </h1>
                {sessionInfo?.description && (
                  <p className="text-sm text-slate-600 mb-3 truncate">
                    {sessionInfo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  총 {stats.totalLectures}회차 강의
                </div>
                <Badge variant="blue">진행중</Badge>
              </div>

              {/* 출석률 표시 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">출석률</span>
                  <span className="text-blue-600 font-bold">{stats.attendanceRate}%</span>
                </div>
                <Progress value={stats.attendanceRate} className="h-2" />
                <div className="text-xs text-slate-500 text-center">
                  {stats.presentCount}/{stats.totalLectures}회 출석
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 출석 현황 */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">출석 현황</h2>

          {lectures.length > 0 ? (
            <div className="space-y-3">
              {lectures
                .sort((a, b) => new Date(a.lecture_date) - new Date(b.lecture_date))
                .map((lecture, index) => {
                  const attendance = getUserAttendanceForLecture(lecture.id);
                  const status = getAttendanceStatus(attendance);

                  return (
                    <Card
                      key={lecture.id}
                      className={`border ${status.borderColor} ${status.bgColor}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-slate-500 mr-2 flex-shrink-0">
                                {index + 1}회차
                              </span>
                              <h3 className="font-semibold text-slate-900 truncate">
                                {lecture.title || `${index + 1}회차 강의`}
                              </h3>
                            </div>

                            <div className="flex items-center text-sm text-slate-600 space-x-4">
                              <div className="flex items-center truncate">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {lecture.lecture_date ? formatDate(lecture.lecture_date) : '날짜 미정'}
                              </div>
                              {lecture.start_time && (
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatTime(lecture.start_time)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <div className={`flex items-center px-3 py-1 rounded-full ${status.color} ${status.bgColor} border ${status.borderColor}`}>
                              {status.icon}
                              <span className="ml-1 text-sm font-medium">
                                {status.text}
                              </span>
                            </div>

                            {/* 출석 체크 버튼 */}
                            {canCheckAttendance(lecture) && (
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(lecture)}
                                disabled={checkingIn === lecture.id}
                                className="px-3 py-1 text-xs"
                              >
                                {checkingIn === lecture.id ? '처리중...' : '출석 체크'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {attendance?.created_at && (
                          <div className="mt-2 text-xs text-slate-500 truncate">
                            체크 시간: {formatDate(attendance.created_at)} {formatTime(attendance.created_at)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-6 text-center">
                <p className="text-slate-500">등록된 강의가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </section>

      </div>
    </MobileLayout>
  );
}