import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Button } from '../components/mobile/ui/button';
import { Badge } from '../components/mobile/ui/badge';
import { getSession } from '../services/sessionService';
import { getLecturesBySession } from '../services/lectureService';
import { renderWithLinks } from '../utils/renderUtils';

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

export default function SessionInfoPage() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sessionData, lecturesData] = await Promise.all([
        getSession(sessionId),
        getLecturesBySession(sessionId),
      ]);

      setSession(sessionData);
      setLectures(Array.isArray(lecturesData) ? lecturesData.sort((a, b) => new Date(a.lecture_date) - new Date(b.lecture_date)) : []);
    } catch (err) {
      console.error('강좌 정보 조회 실패:', err);
      setError('강좌 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '미정';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  };

  const formatPeriod = () => {
    if (!session) return '기간 미정';
    const start = session.begin_date ? new Date(session.begin_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null;
    const end = session.end_date ? new Date(session.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : null;
    if (start && end) return `${start} ~ ${end}`;
    if (start) return `${start} ~`;
    return '기간 미정';
  };

  if (loading) {
    return (
      <MobileLayout headerTitle="강좌 안내" showBack={true}>
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !session) {
    return (
      <MobileLayout headerTitle="강좌 안내" showBack={true}>
        <div className="p-5">
          <Card className="border-red-100">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error || '강좌를 찾을 수 없습니다.'}</p>
              <Button onClick={fetchData} variant="outline" className="mt-4">다시 시도</Button>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout headerTitle="강좌 안내" showBack={true}>
      <div className="p-5 space-y-6">

        {/* 강좌 헤더 */}
        <section>
          <Card className="border-slate-100 bg-slate-50/50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold text-slate-900 flex-1">{session.title}</h1>
                {session.course_status === 'IN_PROGRESS' && <Badge variant="blue">진행중</Badge>}
                {session.course_status === 'FINISHED' && <Badge variant="green">완료</Badge>}
                {session.course_status === 'RECRUITING' && <Badge variant="gray">모집예정</Badge>}
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {session.lecturer_info && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 flex-shrink-0 text-slate-400"/>
                    <span>{session.lecturer_info}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 flex-shrink-0 text-slate-400"/>
                  <span>{formatPeriod()}</span>
                </div>
                {session.date_info && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 flex-shrink-0 text-slate-400"/>
                    <span>{session.date_info}</span>
                  </div>
                )}
              </div>

              {lectures.length > 0 && (
                <div className="text-sm text-slate-500">
                  총 {lectures.length}회차 강의
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 강좌 소개 */}
        {session.description && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">강좌 소개</h2>
            <Card className="border-slate-100">
              <CardContent className="p-5">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {renderWithLinks(session.description)}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 커리큘럼 */}
        {lectures.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">커리큘럼</h2>
            <Card className="border-slate-100">
              <CardContent className="p-0">
                {lectures.map((lecture, index) => (
                  <div
                    key={lecture.id}
                    className={`flex items-center gap-4 px-5 py-3.5 text-sm ${
                      index < lectures.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <span className="text-slate-400 font-medium w-8 flex-shrink-0">
                      {lecture.sequence || index + 1}강
                    </span>
                    <span className="text-slate-800 flex-1 truncate">
                      {lecture.title || `${index + 1}회차 강의`}
                    </span>
                    {lecture.lecture_date && (
                      <span className="text-slate-400 flex-shrink-0">
                        {formatDate(lecture.lecture_date)}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

      </div>
    </MobileLayout>
  );
}
