'use client'
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const CSS = `
#app{width:100%;max-width:430px;min-height:100vh;min-height:100dvh;margin:0 auto;background:#fff;display:flex;flex-direction:column}
.tb{display:flex;align-items:center;justify-content:center;padding:14px 20px;position:relative;border-bottom:1px solid #f0f0f0;flex-shrink:0}
.tb h2{font-size:16px;font-weight:700;color:#0a0a0a}
.bk{position:absolute;left:16px;background:none;border:none;cursor:pointer;font-size:22px;color:#6a7282;width:36px;height:36px;display:flex;align-items:center;justify-content:center}
.sl{flex:1;overflow-y:auto;padding:20px}
.sl::-webkit-scrollbar{display:none}
.item-card{display:flex;align-items:center;gap:12px;background:#f5f5f5;border-radius:12px;padding:12px 14px;margin-bottom:24px}
.item-img{width:56px;height:56px;border-radius:8px;object-fit:cover;background:#e5e7eb;flex-shrink:0}
.item-name{font-size:15px;font-weight:600;color:#0a0a0a}
.item-badge{display:inline-block;background:#dcfce7;color:#008236;font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;margin-top:4px}
.sec-label{font-size:13px;font-weight:600;color:#0a0a0a;margin-bottom:8px}
.sec{margin-bottom:20px}
.form-input{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-size:14px;font-family:'Noto Sans KR',sans-serif;color:#0a0a0a;outline:none}
.form-input:focus{border-color:#00C950}
.form-input::placeholder{color:#94a3b8}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{padding:8px 16px;border-radius:20px;border:1.5px solid #e5e7eb;font-size:13px;font-family:'Noto Sans KR',sans-serif;cursor:pointer;color:#6a7282;font-weight:500;background:#fff}
.chip.on{background:#00C950;color:#fff;border-color:#00C950}
.photo-area{width:100%;aspect-ratio:16/9;background:#f5f5f5;border-radius:12px;border:1.5px dashed #e5e7eb;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative}
.photo-area img{width:100%;height:100%;object-fit:cover}
.photo-placeholder{display:flex;flex-direction:column;align-items:center;gap:6px;color:#94a3b8}
.bwrap{padding:12px 20px calc(20px + env(safe-area-inset-bottom));flex-shrink:0}
.btn{width:100%;padding:15px;background:#00C950;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:'Noto Sans KR',sans-serif;cursor:pointer}
.btn:disabled{background:#e5e7eb;color:#94a3b8;cursor:not-allowed}
.textarea{width:100%;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-size:14px;font-family:'Noto Sans KR',sans-serif;color:#0a0a0a;outline:none;resize:none;min-height:80px}
.textarea:focus{border-color:#00C950}
.textarea::placeholder{color:#94a3b8}
.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;white-space:nowrap;z-index:999;animation:fadein .2s}
.bonus-sec{background:#f9fafb;border-radius:14px;padding:16px;margin-bottom:20px}
.bonus-title{font-size:13px;font-weight:700;color:#0a0a0a;margin-bottom:12px}
.bonus-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border:1.5px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:8px;cursor:pointer}
.bonus-row.done{border-color:#00C950;background:#f0fdf4}
.bonus-row-label{font-size:13px;color:#0a0a0a;font-weight:500}
.bonus-pts{font-size:13px;font-weight:700;color:#00C950;margin-right:8px}
@keyframes fadein{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

const WHEN_OPTIONS = ['3개월 이내', '6개월 이내', '1년 이내', '1년 이상'];
const POLLUTION_OPTIONS = ['없음', '약간 있음', '있음'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];

function MarketRegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeName = searchParams.get('name') || '';
  const challengeDays = searchParams.get('days') || '';
  const challengeCategory = searchParams.get('category') || '';
  const challengeId = searchParams.get('challengeId') || '';

  const [price, setPrice] = useState('');
  const [when, setWhen] = useState('');
  const [pollution, setPollution] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');
  const [comment, setComment] = useState('');
  const [autoPhotos, setAutoPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [bonusPhotos, setBonusPhotos] = useState({ detail: null, front: null, wash: null });
  const [bonusPts, setBonusPts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const BONUS_PTS = { detail: 50, front: 50, wash: 100 };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleBonusPhoto = (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      setBonusPhotos(prev => ({ ...prev, [key]: { file: f, url } }));
      if (!bonusPhotos[key]) {
        setBonusPts(prev => prev + BONUS_PTS[key]);
        const curPts = parseInt(localStorage.getItem('userPoints') || '0', 10);
        localStorage.setItem('userPoints', String(curPts + BONUS_PTS[key]));
      }
    };
    input.click();
  };

  // 챌린지 등록 사진 + 인증 사진 자동 불러오기
  useEffect(() => {
    if (!challengeId) return;
    const kakaoId = localStorage.getItem('kakaoId');

    async function loadPhotos() {
      const photos = [];

      // 챌린지 등록 때 찍은 사진
      const { data: challenge } = await supabase
        .from('challenges')
        .select('photo_url')
        .eq('id', challengeId)
        .single();
      if (challenge?.photo_url) photos.push(challenge.photo_url);

      // 챌린지 인증 사진들
      const { data: logs } = await supabase
        .from('challenge_logs')
        .select('photo_url')
        .eq('challenge_id', challengeId)
        .eq('kakao_id', kakaoId)
        .order('logged_at', { ascending: true });
      (logs || []).forEach(l => { if (l.photo_url) photos.push(l.photo_url); });

      setAutoPhotos(photos);
      if (photos.length > 0) setSelectedPhoto(photos[0]);
    }
    loadPhotos();
  }, [challengeId]);

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhoto(URL.createObjectURL(f));
  };

  const canSubmit = price && when && pollution && size && material;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const kakaoId = localStorage.getItem('kakaoId');
      const nickname = localStorage.getItem('userNickname') || '';
      const photoUrl = selectedPhoto || autoPhotos[0] || null;
      const allPhotos = autoPhotos.length > 0 ? autoPhotos : (photoUrl ? [photoUrl] : []);

      // 보너스 사진 업로드
      const bonusUrls = {};
      for (const [key, val] of Object.entries(bonusPhotos)) {
        if (val?.file) {
          const ext = val.file.name.split('.').pop();
          const path = `bonus/${kakaoId}/${key}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('challenge-photos')
            .upload(path, val.file, { contentType: val.file.type, upsert: false });
          if (!upErr) {
            const { data } = supabase.storage.from('challenge-photos').getPublicUrl(path);
            bonusUrls[key] = data.publicUrl;
          }
        }
      }

      await supabase.from('market_items').insert({
        kakao_id: kakaoId,
        seller: nickname,
        name: challengeName,
        days: parseInt(challengeDays) || 0,
        category: challengeCategory,
        price,
        purchased_when: when,
        pollution,
        size,
        material,
        comment,
        photo_url: photoUrl,
        photos: allPhotos,
        status: 'active',
        bonus_photos: Object.keys(bonusUrls).length > 0 ? bonusUrls : null,
      });

      showToast('마켓에 등록됐어요 🎉');
      setTimeout(() => { router.refresh(); router.push('/market'); }, 1200);
    } catch (err) {
      console.error(err);
      showToast('등록 중 오류가 발생했어요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div id="app">
        <div className="tb">
          <button className="bk" onClick={() => router.back()}>‹</button>
          <h2>마켓 등록</h2>
        </div>

        <div className="sl">
          {/* 챌린지 아이템 정보 */}
          <div className="item-card">
            {selectedPhoto
              ? <img className="item-img" src={selectedPhoto} alt={challengeName} />
              : <div className="item-img" />
            }
            <div>
              <div className="item-name">{challengeName || '아이템'}</div>
              {challengeDays && (
                <span className="item-badge">{challengeDays}일 챌린지 완료</span>
              )}
            </div>
          </div>

          {/* 대표 사진 선택 */}
          <div className="sec">
            <div className="sec-label">대표 사진</div>
            <div style={{display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px', marginBottom:'4px'}}>
              {autoPhotos.map((url, i) => (
                <div key={i} onClick={() => { setSelectedPhoto(url); setPhotoFile(null); }}
                  style={{flexShrink:0, width:'90px', height:'90px', borderRadius:'10px', overflow:'hidden', border: selectedPhoto === url ? '2.5px solid #00C950' : '2px solid #e5e7eb', cursor:'pointer'}}>
                  <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
              ))}
            </div>
            <div style={{fontSize:'12px', color:'#94a3b8'}}>대표로 올릴 사진을 선택하세요</div>
          </div>

          {/* 구매 가격 */}
          <div className="sec">
            <div className="sec-label">💰 구매 가격</div>
            <input className="form-input" placeholder="예: 45,000원" value={price} onChange={e => setPrice(e.target.value)} />
          </div>

          {/* 구매 시점 */}
          <div className="sec">
            <div className="sec-label">🗓 구매 시점</div>
            <div className="chips">
              {WHEN_OPTIONS.map(o => (
                <button key={o} className={`chip${when === o ? ' on' : ''}`} onClick={() => setWhen(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* 오염 여부 */}
          <div className="sec">
            <div className="sec-label">✨ 오염 여부</div>
            <div className="chips">
              {POLLUTION_OPTIONS.map(o => (
                <button key={o} className={`chip${pollution === o ? ' on' : ''}`} onClick={() => setPollution(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* 사이즈 */}
          <div className="sec">
            <div className="sec-label">📐 사이즈</div>
            <div className="chips">
              {SIZE_OPTIONS.map(o => (
                <button key={o} className={`chip${size === o ? ' on' : ''}`} onClick={() => setSize(o)}>{o}</button>
              ))}
            </div>
          </div>

          {/* 소재 */}
          <div className="sec">
            <div className="sec-label">🧵 소재</div>
            <input className="form-input" placeholder="예: 면 100%, 폴리에스터 60% 등" value={material} onChange={e => setMaterial(e.target.value)} />
          </div>

          {/* 판매자 한마디 */}
          <div className="sec">
            <div className="sec-label">💬 판매자 한마디 (선택)</div>
            <textarea className="textarea" placeholder="아이템에 대해 자유롭게 소개해주세요" value={comment} onChange={e => setComment(e.target.value)} />
          </div>

          {/* 추가 인증으로 보너스 포인트 */}
          <div className="bonus-sec">
            <div className="bonus-title">추가 인증으로 보너스 포인트 받기 {bonusPts > 0 && <span style={{color:'#00C950'}}>+{bonusPts}P 적립됨!</span>}</div>
            {[
              { key: 'detail', label: '소재 디테일 확대 사진 업로드', pts: 50 },
              { key: 'front',  label: '옷 단독 정면 사진 업로드',     pts: 50 },
              { key: 'wash',   label: '세탁 인증 사진 업로드',         pts: 100 },
            ].map(({ key, label, pts }) => (
              <div key={key} className={`bonus-row${bonusPhotos[key] ? ' done' : ''}`} onClick={() => handleBonusPhoto(key)}>
                <span className="bonus-row-label">{bonusPhotos[key] ? '✅ ' : ''}{label}</span>
                <div style={{display:'flex', alignItems:'center'}}>
                  <span className="bonus-pts">+{pts} pts</span>
                  {bonusPhotos[key]
                    ? <img src={bonusPhotos[key].url} alt="" style={{width:32, height:32, borderRadius:6, objectFit:'cover'}} />
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  }
                </div>
              </div>
            ))}
          </div>

          <div style={{height: '8px'}} />
        </div>

        <div className="bwrap">
          <button className="btn" disabled={!canSubmit || loading} onClick={handleSubmit}>
            {loading ? '등록 중...' : '마켓에 등록하기'}
          </button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

export default function MarketRegisterPage() {
  return (
    <Suspense fallback={null}>
      <MarketRegisterInner />
    </Suspense>
  );
}
