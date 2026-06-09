'use client'
import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { supabase } from '@/lib/supabase';

function getDaysElapsed(startDate) {
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
}

const CSS = `
.cl-screen{background:#f5f5f5}
.cl-content{background:#f5f5f5}
.chal-card{background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:16px;cursor:pointer;transition:border-color .15s}
.chal-card.selected{border-color:#00C950;background:#f0fdf4}
.btn-main{width:100%;padding:14px;background:#00C950;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;font-family:'Noto Sans KR',sans-serif;cursor:pointer;letter-spacing:-.15px}
.btn-main:disabled{background:#e5e7eb;color:#94a3b8;cursor:not-allowed}
.btn-sub{width:100%;padding:14px;background:#fff;color:#0a0a0a;border:1.5px solid #e5e7eb;border-radius:12px;font-size:15px;font-weight:500;font-family:'Noto Sans KR',sans-serif;cursor:pointer;letter-spacing:-.15px}
.cam-wrap{position:relative;margin:20px;border-radius:20px;overflow:hidden;background:#000;flex-shrink:0}
.cam-video{width:100%;display:block;border-radius:20px;object-fit:cover;height:400px}
.cam-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:20px}
.cam-guide{border:2px solid rgba(255,255,255,.6);border-radius:16px;width:80%;height:60%;display:flex;align-items:center;justify-content:center}
.cam-guide-txt{color:rgba(255,255,255,.8);font-size:13px;font-weight:500;text-align:center;line-height:1.6}
.cam-badge{background:rgba(0,0,0,.5);color:#fff;font-size:12px;font-weight:600;padding:6px 14px;border-radius:20px;backdrop-filter:blur(6px)}
.shutter-row{display:flex;align-items:center;justify-content:center;gap:40px;padding:0 0 12px}
.shutter-btn{width:72px;height:72px;border-radius:50%;border:4px solid #fff;background:rgba(255,255,255,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:transform .1s}
.shutter-btn:active{transform:scale(.93)}
.shutter-inner{width:56px;height:56px;border-radius:50%;background:#fff}
.cam-side-btn{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.cam-side-btn svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.preview-wrap{margin:20px;border-radius:20px;overflow:hidden;position:relative}
.preview-img{width:100%;border-radius:20px;display:block;object-fit:cover;max-height:360px}
.preview-retake{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.55);color:#fff;border:none;border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;font-family:'Noto Sans KR',sans-serif;cursor:pointer;backdrop-filter:blur(4px)}
.photo-tips{margin:0 20px 16px;background:#f0fdf4;border-radius:12px;padding:14px 16px}
.photo-tips p{font-size:12px;color:#008236;font-weight:600;margin-bottom:6px}
.photo-tips ul{padding-left:16px}
.photo-tips li{font-size:12px;color:#008236;line-height:1.8}
.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;white-space:nowrap;z-index:999;animation:fadein .2s}
@keyframes fadein{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

export default function ChallengeLogPage() {
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'camera'
  const [cameraMode, setCameraMode] = useState('idle'); // idle | live | preview
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const kakaoId = localStorage.getItem('kakaoId');
    if (!kakaoId) return;
    supabase
      .from('challenges')
      .select('*')
      .eq('kakao_id', kakaoId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setChallenges(data || []));
  }, []);

  // 카메라 시작
  async function startCamera(facing = facingMode) {
    if (!navigator.mediaDevices?.getUserMedia) { setCameraMode('idle'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraMode('live');
    } catch {
      setCameraMode('idle');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  // step === 'camera' 이고 사진 없으면 카메라 자동 시작
  useEffect(() => {
    if (step !== 'camera' || capturedPhoto) return;
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, capturedPhoto]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  function takePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
    setCameraMode('preview');
  }

  async function flipCamera() {
    stopCamera();
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  }

  function retake() {
    setCapturedPhoto(null);
    setCameraMode('idle');
    startCamera();
  }

  async function handleUpload() {
    if (!selected || !capturedPhoto) return;
    setLoading(true);
    try {
      const kakaoId = localStorage.getItem('kakaoId');
      // base64 → Blob
      const res = await fetch(capturedPhoto);
      const blob = await res.blob();
      const path = `${kakaoId}/${selected.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('challenge-photos')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('challenge-photos').getPublicUrl(path);

      await supabase.from('challenge_logs').insert({
        challenge_id: selected.id,
        kakao_id: kakaoId,
        photo_url: urlData.publicUrl,
        logged_at: new Date().toISOString(),
      });

      showToast('인증 완료! 🎉');
      setStep('select');
      setSelected(null);
      setCapturedPhoto(null);
      setCameraMode('idle');
    } catch (err) {
      console.error(err);
      showToast('업로드 중 오류가 발생했어요');
    } finally {
      setLoading(false);
    }
  }

  const elapsed = selected ? getDaysElapsed(selected.start_date) : 0;
  const progress = selected ? Math.min(100, Math.round((elapsed / selected.days) * 100)) : 0;

  return (
    <>
      <style>{CSS}</style>
      <AppShell active="challenge" className="cl-screen" contentClassName="cl-content">

        {/* 헤더 */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a0a0a', letterSpacing: '-0.45px' }}>챌린지 인증</div>
          <div style={{ fontSize: '14px', color: '#6a7282', marginTop: '2px', letterSpacing: '-0.15px' }}>
            {step === 'select' ? '인증할 챌린지를 선택해주세요' : '오늘의 챌린지를 사진으로 인증해보세요'}
          </div>
        </div>

        {/* STEP 1: 챌린지 선택 */}
        {step === 'select' && (
          <div style={{ padding: '12px 20px 20px' }}>
            {challenges.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#6a7282', fontSize: '14px' }}>
                등록된 챌린지가 없어요
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {challenges.map(c => {
                  const el = getDaysElapsed(c.start_date);
                  const pg = Math.min(100, Math.round((el / c.days) * 100));
                  const isDone = el >= c.days;
                  return (
                    <div
                      key={c.id}
                      className={`chal-card${selected?.id === c.id ? ' selected' : ''}${isDone ? ' done' : ''}`}
                      onClick={() => !isDone && setSelected(c)}
                      style={isDone ? { opacity: 0.5, cursor: 'default' } : {}}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: '#0a0a0a' }}>{c.name}</span>
                        {isDone
                          ? <span style={{ fontSize: '11px', fontWeight: 600, color: '#008236', background: '#dcfce7', borderRadius: '999px', padding: '3px 10px' }}>완료</span>
                          : <span style={{ fontSize: '11px', fontWeight: 600, color: '#1447e6', background: '#dbeafe', borderRadius: '999px', padding: '3px 10px' }}>진행 중</span>
                        }
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6a7282' }}>{el}일 / {c.days}일</span>
                      </div>
                      <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ background: isDone ? '#94a3b8' : '#00C950', height: '6px', borderRadius: '999px', width: `${pg}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="btn-main" disabled={!selected} onClick={() => setStep('camera')}>
              다음으로 가기
            </button>
          </div>
        )}

        {/* STEP 2: 카메라 */}
        {step === 'camera' && (
          <div>
            {/* 선택된 챌린지 요약 */}
            <div style={{ margin: '12px 20px 0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0a0a0a' }}>{selected?.name}</span>
                <span style={{ fontSize: '12px', color: '#6a7282' }}>{elapsed}일 / {selected?.days}일</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#00C950', height: '6px', borderRadius: '999px', width: `${progress}%` }} />
              </div>
            </div>

            {/* 라이브 카메라 */}
            {cameraMode === 'live' && (
              <div>
                <div className="cam-wrap" style={{ height: '400px' }}>
                  <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
                  <div className="cam-overlay">
                    <span className="cam-badge">{facingMode === 'environment' ? '후면 카메라' : '전면 카메라'}</span>
                    <div className="cam-guide">
                      <p className="cam-guide-txt">오늘 착용한 옷을<br/>잘 보이게 찍어주세요 👕</p>
                    </div>
                    <div className="shutter-row">
                      <button className="cam-side-btn" onClick={flipCamera}>
                        <svg viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                      </button>
                      <button className="shutter-btn" onClick={takePhoto}>
                        <div className="shutter-inner"></div>
                      </button>
                      {/* 갤러리 버튼 없음 — 카메라 전용 */}
                      <div style={{ width: 44 }} />
                    </div>
                  </div>
                </div>
                <div className="photo-tips">
                  <p>📌 인증 가이드</p>
                  <ul>
                    <li>오늘 실제로 착용한 옷을 찍어주세요</li>
                    <li>밝은 곳에서 옷이 잘 보이게 찍어요</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 사진 미리보기 */}
            {cameraMode === 'preview' && capturedPhoto && (
              <div>
                <div className="preview-wrap">
                  <img className="preview-img" src={capturedPhoto} alt="인증 사진" />
                  <button className="preview-retake" onClick={retake}>다시 찍기</button>
                </div>
                <div className="photo-tips">
                  <p>✅ 사진이 잘 나왔나요?</p>
                  <ul>
                    <li>오늘 착용한 옷이 잘 보이나요?</li>
                    <li>마음에 들지 않으면 다시 찍어보세요</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-main" disabled={!capturedPhoto || loading} onClick={handleUpload}>
                {loading ? '등록 중...' : '이 사진으로 등록하기'}
              </button>
              <button className="btn-sub" onClick={() => { stopCamera(); setStep('select'); setCapturedPhoto(null); setCameraMode('idle'); }}>
                챌린지 다시 선택
              </button>
            </div>
          </div>
        )}

      </AppShell>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
