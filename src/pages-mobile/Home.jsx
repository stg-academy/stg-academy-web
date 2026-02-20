import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Button } from '../components/mobile/ui/button';
import { Progress } from '../components/mobile/ui/progress';
import { Badge } from '../components/mobile/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { getEnrollsByUser } from '../services/enrollService';
import { getSessions } from '../services/sessionService';

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const TrophyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export default function Home() {
  const { user } = useAuth();
  const [activeCourses, setActiveCourses] = useState([]);
  const [recruitingSessions, setRecruitingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, [user?.id]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // 모든 강좌 목록 조회
      const allSessions = await getSessions(0, 50);

      if (user?.id) {
        // 로그인한 사용자의 수강 중인 강의
        const enrollments = await getEnrollsByUser(user.id);
        const activeEnrollments = Array.isArray(enrollments)
          ? enrollments.filter(e => e.enroll_status === 'ENROLLED' || e.enroll_status === 'ACTIVE')
          : [];

        setActiveCourses(activeEnrollments.slice(0, 3)); // 최대 3개만
      }

      // 모집중인 강좌 (session_status가 RECRUITING인 것들)
      const recruiting = Array.isArray(allSessions)
        ? allSessions.filter(session => session.session_status === 'RECRUITING')
        : [];

      setRecruitingSessions(recruiting.slice(0, 4)); // 최대 4개만

    } catch (error) {
      console.error('홈 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment) => {
    // 실제 진행률 계산 로직 (임시)
    if (enrollment.session?.lecture_count) {
      return Math.floor(Math.random() * 80) + 20; // 20-100% 사이의 임시값
    }
    return 30;
  };

  const calculateAttendanceRate = (enrollment) => {
    // 실제 출석률 계산 로직 (임시)
    return Math.floor(Math.random() * 30) + 70; // 70-100% 사이의 임시값
  };

  const formatPeriod = (session) => {
    if (session.start_date && session.end_date) {
      const start = new Date(session.start_date);
      const end = new Date(session.end_date);
      return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}~${String(end.getMonth() + 1).padStart(2, '0')}`;
    }
    return "기간 미정";
  };

  const getDeadline = (session) => {
    if (session.registration_deadline) {
      const deadline = new Date(session.registration_deadline);
      const now = new Date();
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `D-${diffDays}`;
      } else if (diffDays === 0) {
        return "D-Day";
      } else {
        return "마감";
      }
    }
    return "D-?";
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-5 space-y-8">

        {/* Active Course Section */}
        {user && activeCourses.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">수강중인 교육</h2>
              <Link to="/my-learning" className="text-xs text-slate-500 font-medium flex items-center">
                전체보기 <ChevronRightIcon className="h-3 w-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeCourses.map((enrollment) => {
                const progress = calculateProgress(enrollment);
                const attendanceRate = calculateAttendanceRate(enrollment);

                return (
                  <Link to={`/course/${enrollment.session_id}`} key={enrollment.id}>
                    <Card className="border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-slate-800 text-lg">
                            {enrollment.session_title || enrollment.session?.title || '강의명 없음'}
                          </h3>
                          <Badge variant="blue">진행중</Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">진행도</span>
                              <span className="text-blue-600 font-bold">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          <div className="flex justify-between text-sm pt-1">
                            <span className="text-slate-500">출석률</span>
                            <span className="text-slate-900 font-semibold">{attendanceRate}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recruiting Courses Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">모집중인 강의</h2>
            <Link to="/courses" className="text-xs text-slate-500 font-medium flex items-center">
              더보기 <ChevronRightIcon className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          {recruitingSessions.length > 0 ? (
            <div className="grid gap-3">
              {recruitingSessions.map((session) => (
                <Link to={`/course/${session.id}/recruit`} key={session.id}>
                  <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-800">{session.title}</h3>
                        <p className="text-sm text-slate-500">기간: {formatPeriod(session)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="blue" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                          신청마감 {getDeadline(session)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-slate-500">현재 모집중인 강의가 없어요</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Welcome Section for non-logged users */}
        {!user && (
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">STG 아카데미에 오신 것을 환영합니다</h2>
              <p className="text-slate-600 mb-6">다양한 강의를 수강하고 성장해보세요.</p>
              <Link to="/login">
                <Button className="w-full max-w-xs">
                  로그인하여 시작하기
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Ranking Placeholder */}
        <section className="pt-2">
          <Card className="bg-gradient-to-br from-slate-50 to-white border-dashed border-slate-200">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center mb-1">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-slate-400">이달의 열심 수강생</h3>
              <p className="text-xs text-slate-400">랭킹 시스템이 곧 오픈됩니다!</p>
            </CardContent>
          </Card>
        </section>

      </div>
    </MobileLayout>
  );
}