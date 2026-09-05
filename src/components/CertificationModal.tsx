import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { StudentProfile, ClimateCertification } from '../types';
import { 
  saveCertification, 
  subscribeCertifications, 
  likeCertification 
} from '../lib/firebase';
import { sound } from '../lib/audio';
import html2canvas from 'html2canvas';
import { 
  Camera, 
  Award, 
  Heart, 
  Send, 
  Download, 
  CheckCircle, 
  Sparkles, 
  X, 
  Flame, 
  Leaf, 
  Bike, 
  Zap, 
  Recycle, 
  Megaphone,
  Share2
} from 'lucide-react';

interface CertificationModalProps {
  profile: StudentProfile;
  onClose: () => void;
}

export function CertificationModal({ profile, onClose }: CertificationModalProps) {
  const [certs, setCerts] = useState<ClimateCertification[]>([]);
  const [pledgeText, setPledgeText] = useState('');
  const [category, setCategory] = useState<ClimateCertification['actionCategory']>('energy');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'feed'>('card');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to real-time certifications
  useEffect(() => {
    const unsub = subscribeCertifications((list) => {
      setCerts(list);
    });
    return () => unsub();
  }, []);

  const categories = [
    { id: 'energy' as const, label: '에너지 절약', icon: Zap, placeholder: '외출 시 멀티탭 전원을 끄고 적정 실내온도를 지키겠습니다.' },
    { id: 'transport' as const, label: '친환경 이동', icon: Bike, placeholder: '가까운 거리는 걷거나 자전거를 타고 대중교통을 이용하겠습니다.' },
    { id: 'recycling' as const, label: '자원순환', icon: Recycle, placeholder: '일회용 플라스틱 대신 텀블러를 쓰고 올바르게 분리배출하겠습니다.' },
    { id: 'nature' as const, label: '생태 & 식목', icon: Leaf, placeholder: '교실과 화단에 식물을 가꾸고 음식물 쓰레기를 남기지 않겠습니다.' },
    { id: 'advocacy' as const, label: '기후행동 알리기', icon: Megaphone, placeholder: '가족과 친구들에게 기후위기의 심각성을 알리고 함께 실천하겠습니다.' },
  ];

  const handleCaptureCard = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    sound.playCoin();

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `기후행동인증서_${profile.manageCode}_Lv${profile.level}.png`;
      link.href = dataUrl;
      link.click();
      sound.playLevelClear();
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmitPledge = async (e: FormEvent) => {
    e.preventDefault();
    if (!pledgeText.trim() || submitting) return;

    setSubmitting(true);
    sound.playMilestoneBonus();

    try {
      await saveCertification({
        manageCode: profile.manageCode,
        nickname: profile.nickname,
        level: profile.level,
        isMaster: !!profile.isMaster,
        pledge: pledgeText.trim(),
        actionCategory: category,
        likes: 0,
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
      setPledgeText('');
      setActiveTab('feed');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (certId: string) => {
    if (likedIds.has(certId)) return;
    sound.playCoin();
    setLikedIds((prev) => new Set([...prev, certId]));
    await likeCertification(certId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-3 border-emerald-500/80 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-pixel font-bold text-white flex items-center gap-2">
                기후행동 인증소 & 명예의 전당
              </h2>
              <p className="text-[11px] text-slate-400">
                기후위기 탈출 런 활동 인증서를 캡처하고 실천 다짐을 등록하세요!
              </p>
            </div>
          </div>

          <button
            id="btn-close-cert-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            id="tab-cert-card"
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-2 px-3 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-emerald-600 text-white border-2 border-emerald-300 shadow-md font-bold'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>내 활동 인증서 & 캡처</span>
          </button>

          <button
            id="tab-cert-feed"
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`py-2 px-3 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-emerald-600 text-white border-2 border-emerald-300 shadow-md font-bold'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>모두의 실천 인증 피드 ({certs.length})</span>
          </button>
        </div>

        {/* Tab 1: My Certificate Card & Capture */}
        {activeTab === 'card' && (
          <div className="space-y-4">
            {/* Printable & Capturable Certificate Card */}
            <div
              ref={cardRef}
              id="eco-certificate-card"
              className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 border-4 border-emerald-400 text-white shadow-2xl overflow-hidden font-sans"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 text-emerald-400 font-pixel text-xs">◆ ◆</div>
              <div className="absolute top-2 right-2 text-emerald-400 font-pixel text-xs">◆ ◆</div>
              <div className="absolute bottom-2 left-2 text-emerald-400 font-pixel text-xs">◆ ◆</div>
              <div className="absolute bottom-2 right-2 text-emerald-400 font-pixel text-xs">◆ ◆</div>

              {/* Title Block */}
              <div className="text-center space-y-1 pb-4 border-b border-emerald-500/40">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] font-pixel">
                  <Sparkles className="w-3 h-3" />
                  REPUBLIC OF CLIMATE CITIZEN
                </div>
                <h3 className="text-lg sm:text-xl font-black font-pixel text-emerald-300 tracking-wide">
                  기후위기 탈출 런 실천 인증서
                </h3>
                <p className="text-[11px] text-slate-300">
                  위 학생은 해수면 상승을 막기 위해 나무를 심고 기후 지식을 습득하였음을 인증합니다.
                </p>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">탐험가 닉네임</span>
                  <span className="font-bold text-white truncate block">{profile.nickname}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">관리코드</span>
                  <span className="font-mono font-bold text-emerald-400 block">{profile.manageCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">도달 단계</span>
                  <span className="font-pixel font-bold text-yellow-300 block">Lv. {profile.level}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">지구 온도</span>
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 inline" />
                    +{profile.earthTemp.toFixed(2)}°C
                  </span>
                </div>
              </div>

              {/* Pledge Display */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-600/50 mb-4">
                <span className="text-[10px] font-pixel text-emerald-300 block mb-1">
                  🌱 나의 기후행동 실천 다짐:
                </span>
                <p className="text-xs text-emerald-100 font-medium italic">
                  "{pledgeText.trim() || '탄소 배출을 줄이고 나무를 아끼며 푸른 지구를 지키겠습니다.'}"
                </p>
              </div>

              {/* Official Seal and Date Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="block text-[10px]">인증 일자</span>
                  <span className="text-white font-mono">{new Date().toLocaleDateString('ko-KR')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="block text-[10px] text-emerald-400 font-pixel">
                      {profile.isMaster ? 'MASTER HERO' : 'ECO HERO'}
                    </span>
                    <span className="text-slate-300 text-[10px]">기후행동 실천본부</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-[9px] font-pixel text-emerald-300 rotate-[-12deg] bg-emerald-500/10">
                    인증필
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar: Capture and Pledge Input */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                id="btn-capture-download"
                type="button"
                disabled={capturing}
                onClick={handleCaptureCard}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-pixel text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{capturing ? '캡처 중...' : '인증서 이미지 캡처 다운로드'}</span>
              </button>

              <button
                id="btn-go-pledge-tab"
                type="button"
                onClick={() => setActiveTab('feed')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>실천 다짐 등록하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Feed & Pledge Submission */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Pledge Submission Box */}
            <form onSubmit={handleSubmitPledge} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-pixel">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  나의 기후행동 실천 다짐 등록
                </span>
                <span className="text-[10px] text-slate-400">
                  {profile.nickname} ({profile.manageCode})
                </span>
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSel = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        if (!pledgeText) setPledgeText(c.placeholder);
                      }}
                      className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Pledge text input */}
              <div className="flex gap-2">
                <input
                  id="input-pledge-text"
                  type="text"
                  value={pledgeText}
                  onChange={(e) => setPledgeText(e.target.value)}
                  placeholder="오늘부터 실천할 나만의 기후행동 한 줄을 작성해주세요..."
                  maxLength={70}
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  required
                />
                <button
                  id="btn-submit-pledge"
                  type="submit"
                  disabled={submitting || !pledgeText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-pixel text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-md"
                >
                  <Send className="w-3 h-3" />
                  {submitting ? '등록 중...' : '인증 등록'}
                </button>
              </div>

              {submitted && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  실천 다짐이 성공적으로 인증소 피드에 등록되었습니다!
                </div>
              )}
            </form>

            {/* Certifications Feed List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              <span className="text-xs font-pixel text-slate-400 block mb-1">
                실시간 기후 실천 인증 피드 ({certs.length}건)
              </span>

              {certs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
                  아직 등록된 실천 다짐이 없습니다. 첫 번째로 인증 다짐을 남겨보세요!
                </div>
              ) : (
                certs.map((c) => {
                  const isLiked = likedIds.has(c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-start justify-between gap-3 hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{c.nickname}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                            {c.manageCode}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-pixel font-bold">
                            Lv. {c.level}
                          </span>
                          {c.isMaster && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-pixel">
                              MASTER
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-200 font-medium pl-1">
                          "{c.pledge}"
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                          <span>{new Date(c.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleLike(c.id)}
                        disabled={isLiked}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isLiked
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                        title="친구의 기후 실천 응원하기"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span className="font-pixel text-[11px]">{c.likes || 0}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
