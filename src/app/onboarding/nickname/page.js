'use client'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function NicknamePage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('2자 이상 10자 이하로 입력해주세요');
  const [messageClass, setMessageClass] = useState('input-message');
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    const len = v.trim().length;
    if (len === 0) {
      setMessage('2자 이상 10자 이하로 입력해주세요');
      setMessageClass('input-message');
      setIsValid(false);
    } else if (len < 2) {
      setMessage('2자 이상 입력해주세요');
      setMessageClass('input-message error');
      setIsValid(false);
    } else {
      setMessage('사용 가능한 닉네임이에요');
      setMessageClass('input-message success');
      setIsValid(true);
    }
  }

  function handleSubmit() {
    if (!isValid) return;
    const nickname = value.trim();
    localStorage.setItem('userNickname', nickname);
    // 신규 유저 가입 보너스 (게스트 경로)
    const existing = parseInt(localStorage.getItem('userPoints') || '0', 10);
    if (existing === 0) {
      localStorage.setItem('userPoints', '500');
      const kakaoId = localStorage.getItem('kakaoId');
      if (kakaoId) supabase.from('point_history').insert({ kakao_id: kakaoId, amount: 500, reason: '가입 보너스' });
    }
    router.push('/home');
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && isValid) handleSubmit();
  }

  return (
    <>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        html, body { width:100%; height:100%; font-family:-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
        body { background-color:#FFFFFF; display:flex; justify-content:center; min-height:100vh; }
        .header { margin-top:80px; font-size:26px; font-weight:700; line-height:1.4; color:#1A1A1A; letter-spacing:-0.5px; }
        .input-section { margin-top:48px; }
        .input-label { font-size:14px; font-weight:600; color:#333333; margin-bottom:10px; }
        .input-wrapper { position:relative; }
        .nickname-input { width:100%; height:56px; padding:0 50px 0 16px; border:1.5px solid #E5E5E5; border-radius:12px; font-size:16px; font-family:inherit; color:#1A1A1A; outline:none; transition:border-color 0.2s; background-color:#FFFFFF; }
        .nickname-input:focus { border-color:#00C950; }
        .nickname-input::placeholder { color:#BBBBBB; }
        .char-count { position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:13px; color:#888888; pointer-events:none; }
        .input-message { margin-top:8px; font-size:13px; min-height:18px; color:#888888; }
        .input-message.error { color:#FF5757; }
        .input-message.success { color:#00C950; }
        .start-btn { width:100%; height:56px; border-radius:12px; border:none; font-size:16px; font-weight:700; cursor:pointer; font-family:inherit; margin-top:auto; margin-bottom:40px; transition:background-color 0.2s, opacity 0.2s; background-color:#CCCCCC; color:#FFFFFF; }
        .start-btn.active { background-color:#00C950; }
        .start-btn.active:active { opacity:0.85; }
        .start-btn:disabled { cursor:not-allowed; }
        .page-body { display:flex; flex-direction:column; min-height:100vh; width:100%; max-width:430px; padding:0 24px; }
      `}</style>
      <div className="page-body">
        <div className="header">닉네임을 입력해주세요</div>
        <div className="input-section">
          <div className="input-label">닉네임</div>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="nickname-input"
              placeholder="닉네임을 입력하세요"
              maxLength={10}
              autoComplete="off"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
            />
            <div className="char-count">{value.trim().length}/10</div>
          </div>
          <div className={messageClass}>{message}</div>
        </div>
        <button
          className={`start-btn${isValid ? ' active' : ''}`}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          시작하기
        </button>
      </div>
    </>
  );
}
