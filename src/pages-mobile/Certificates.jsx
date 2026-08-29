import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getMyCertifications, getMyCertificationPreview, getMyCertificationDownload } from '../services/certificationService';
import Icon from '../components/ui/Icon.jsx';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
};

// 다운로드 헤더 파싱에 실패했을 때 쓰는 클라이언트 생성 파일명 (문서에 나온 규칙과 동일)
const buildFallbackFilename = (cert) => {
  const safeCourse = (cert.course_title || '수료증').replace(/[\\/:*?"<>|\s]+/g, '_');
  const yyyymmdd = cert.issued_at ? new Date(cert.issued_at).toISOString().slice(0, 10).replace(/-/g, '') : '';
  return `certification_${safeCourse}_${yyyymmdd}.png`;
};

export default function Certificates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [certificates, setCertificates] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewerCert, setViewerCert] = useState(null);

  useEffect(() => {
    if (user) fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // 마이러닝 등에서 특정 수료증으로 딥링크된 경우, 이미지가 준비되면 자동으로 크게 보기
  useEffect(() => {
    if (!highlightId) return;
    const match = certificates.find((c) => c.id === highlightId);
    if (match && previewUrls[highlightId]) {
      setViewerCert(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificates, previewUrls, highlightId]);

  // 언마운트 시 생성해둔 미리보기 object URL 정리
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCertifications();
      setCertificates(Array.isArray(data) ? data : []);

      const urlEntries = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (cert) => {
          try {
            const { blob } = await getMyCertificationPreview(cert.id);
            return [cert.id, URL.createObjectURL(blob)];
          } catch (err) {
            console.error('수료증 미리보기 조회 실패:', err);
            return [cert.id, null];
          }
        })
      );
      setPreviewUrls(Object.fromEntries(urlEntries));
    } catch (err) {
      console.error('수료증 목록 조회 실패:', err);
      setError('수료증 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert) => {
    setDownloadingId(cert.id);
    try {
      const { blob, filename } = await getMyCertificationDownload(cert.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || buildFallbackFilename(cert);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('수료증 다운로드 실패:', err);
      toast.error('수료증 다운로드에 실패했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <MobileLayout headerTitle="내 수료증" showBack={true}>
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-neutral-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout headerTitle="내 수료증" showBack={true}>
        <div className="p-5 text-center py-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-neutral-500 mb-6">내 수료증을 확인하려면 로그인해주세요</p>
          <Button onClick={() => navigate('/login')} className="w-full max-w-xs">로그인하여 시작하기</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout headerTitle="내 수료증" showBack={true}>
      <div className="p-5 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <Icon name="chevron-left" size={16} />
          돌아가기
        </button>

        <h1 className="text-xl font-bold text-neutral-900">내 수료증</h1>

        {error && (
          <Card className="border-error/20 text-center">
            <p className="text-error-text">{error}</p>
          </Card>
        )}

        {!error && certificates.length === 0 && (
          <Card className="text-center">
            <p className="text-sm text-neutral-500">아직 발급된 수료증이 없습니다.</p>
          </Card>
        )}

        {certificates.map((cert) => (
          <Card key={cert.id} className="space-y-3">
            <button
              type="button"
              onClick={() => previewUrls[cert.id] && setViewerCert(cert)}
              className="w-full aspect-[2520/1000] bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center"
            >
              {previewUrls[cert.id] ? (
                <img src={previewUrls[cert.id]} alt={`${cert.course_title} 수료증`} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-neutral-400">미리보기를 불러올 수 없습니다</span>
              )}
            </button>

            <div>
              <p className="text-sm font-semibold text-neutral-900">{cert.course_title}</p>
              <p className="text-xs text-neutral-500">{cert.session_title}</p>
              <p className="text-xs text-neutral-400 mt-1">발급일: {formatDate(cert.issued_at)}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={!previewUrls[cert.id]}
                onClick={() => setViewerCert(cert)}
              >
                크게 보기
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={downloadingId === cert.id}
                onClick={() => handleDownload(cert)}
              >
                {downloadingId === cert.id ? '다운로드 중...' : '다운로드'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 이미지 확대 보기 오버레이 */}
      {viewerCert && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4"
          onClick={() => setViewerCert(null)}
        >
          <button
            onClick={() => setViewerCert(null)}
            className="absolute top-4 right-4 text-white"
            aria-label="닫기"
          >
            <Icon name="x" size={28} />
          </button>
          <img
            src={previewUrls[viewerCert.id]}
            alt={`${viewerCert.course_title} 수료증`}
            className="max-w-full max-h-[80vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MobileLayout>
  );
}
