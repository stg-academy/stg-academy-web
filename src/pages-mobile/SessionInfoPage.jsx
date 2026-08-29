import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import CurriculumList from '../components/ui/CurriculumList.jsx';
import { getSession } from '../services/sessionService';
import { getLecturesBySession } from '../services/lectureService';
import { renderWithLinks } from '../utils/renderUtils';
import Icon from '../components/ui/Icon.jsx';

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
          <div className="text-neutral-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (error || !session) {
    return (
      <MobileLayout headerTitle="강좌 안내" showBack={true}>
        <div className="p-5">
          <Card className="border-error/20 text-center">
            <p className="text-error-text">{error || '강좌를 찾을 수 없습니다.'}</p>
            <Button onClick={fetchData} variant="secondary" className="mt-4">다시 시도</Button>
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
          <Card className="border-neutral-200 bg-neutral-50/50 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-neutral-900 flex-1">{session.title}</h1>
              {session.course_status === 'IN_PROGRESS' && <Badge tone="info">진행중</Badge>}
              {session.course_status === 'FINISHED' && <Badge tone="success">완료</Badge>}
              {session.course_status === 'RECRUITING' && <Badge tone="neutral">모집예정</Badge>}
            </div>

            <div className="space-y-2 text-sm text-neutral-600">
              {session.lecturer_info && (
                <div className="flex items-center gap-2">
                  <Icon name="user" size={16} className="flex-shrink-0 text-neutral-400" />
                  <span>{session.lecturer_info}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon name="calendar" size={16} className="flex-shrink-0 text-neutral-400" />
                <span>{formatPeriod()}</span>
              </div>
              {session.date_info && (
                <div className="flex items-center gap-2">
                  <Icon name="clock" size={16} className="flex-shrink-0 text-neutral-400" />
                  <span>{session.date_info}</span>
                </div>
              )}
            </div>

            {lectures.length > 0 && (
              <div className="text-sm text-neutral-500">
                총 {lectures.length}회차 강의
              </div>
            )}
          </Card>
        </section>

        {/* 강좌 소개 */}
        {session.description && (
          <section>
            <h2 className="text-base font-bold text-neutral-900 mb-3">강좌 소개</h2>
            <Card>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
                {renderWithLinks(session.description)}
              </p>
            </Card>
          </section>
        )}

        <CurriculumList lectures={lectures} />

      </div>
    </MobileLayout>
  );
}
