import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import type { StudentProfile, CharacterGender } from '../types';
import { loadStudentProfile, normalizeCode } from '../lib/firebase';
import { sound } from '../lib/audio';
import { PixelRenderer } from '../lib/pixelArt';
import { Sparkles, Play, RotateCcw, Award, Globe, Flame, Search, BookOpen, Camera, ShoppingBag, Globe2 } from 'lucide-react';
import { StoryModal } from './StoryModal';
import { CertificationModal } from './CertificationModal';
import { ShopModal } from './ShopModal';

interface LoginScreenProps {
  onStartGame: (profile: StudentProfile) => void;
}

export function LoginScreen({ onStartGame }: LoginScreenProps) {
  const [manageCode, setManageCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<CharacterGender>('male');
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<StudentProfile | null>(null);
  const [searched, setSearched] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Canvas preview refs
  const maleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const femaleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render character previews
  useEffect(() => {
    const renderPreview = (canvas: HTMLCanvasElement | null, g: CharacterGender) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      PixelRenderer.drawCharacter(
        ctx,
        16,
        12,
        48,
        56,
        g,
        'idle',
        true,
        0,
        false
      );
    };

    renderPreview(maleCanvasRef.current, 'male');
    renderPreview(femaleCanvasRef.current, 'female');
  }, []);

  const handleCheckCode = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = normalizeCode(manageCode);
    if (!cleanCode) return;

    setLoading(true);
    sound.playCoin();
    try {
      const profile = await loadStudentProfile(cleanCode);
      if (profile) {
        setExistingProfile(profile);
        setNickname(profile.nickname);
        setGender(profile.gender || 'male');
      } else {
        setExistingProfile(null);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      setExistingProfile(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (isResume: boolean) => {
    const cleanCode = normalizeCode(manageCode);
    if (!cleanCode) return;

    sound.playJump();

    if (isResume && existingProfile) {
      onStartGame(existingProfile);
      return;
    }

    const finalNickname = nickname.trim() || `기후탐험가_${cleanCode.slice(-4) || '1'}`;
    const newProfile: StudentProfile = {
      manageCode: cleanCode,
      nickname: finalNickname,
      gender,
      level: 1,
      score: 0,
      earthTemp: 1.2,
      coins: 0,
      lastPlayedAt: new Date().toISOString(),
      unlockedSkills: [],
      highestLevel: 1,
      isMaster: false,
    };

    onStartGame(newProfile);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white relative overflow-hidden">
      {/* Background Animated Pixel Waves & Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-cyan-600 to-transparent" />
        <div className="absolute top-10 left-10 text-6xl opacity-30">☁️</div>
        <div className="absolute top-24 right-20 text-5xl opacity-30">☁️</div>
      </div>

      <div className="relative z-10 w-full max-w-xl bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Title Badge */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-pixel">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            기후 데이터 연동 실시간 교육 웹 게임
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span className="text-emerald-400 font-pixel">기후위기 탈출 런</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            탄소 배출 변수를 피하고 나무를 심어 해수면 상승을 막으세요!
          </p>
        </div>

        {/* Step 1: Manage Code Input */}
        <form onSubmit={handleCheckCode} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center justify-between">
              <span>🔑 관리코드 입력 (학생 / 학급 코드)</span>
              <span className="text-[10px] text-slate-400 font-normal">어떤 기기든 코드 하나로 이어하기</span>
            </label>
            <div className="flex gap-2">
              <input
                id="input-manage-code"
                type="text"
                placeholder="예: ECO-2026, CLASS-10"
                value={manageCode}
                onChange={(e) => {
                  setManageCode(e.target.value);
                  setSearched(false);
                }}
                className="flex-1 bg-slate-800 border-2 border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 uppercase font-mono tracking-wider focus:outline-none"
                required
              />
              <button
                id="btn-check-code"
                type="submit"
                disabled={loading || !manageCode.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md font-pixel"
              >
                <Search className="w-3.5 h-3.5" />
                {loading ? '확인 중...' : '기록 확인'}
              </button>
            </div>
          </div>
        </form>

        {/* Existing Profile Found Alert */}
        {searched && existingProfile && (
          <div className="mb-6 bg-slate-800/80 border-2 border-amber-400/80 rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>저장된 이전 기록이 발견되었습니다!</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">닉네임</span>
                <span className="font-bold text-white truncate block">{existingProfile.nickname}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">현재 레벨</span>
                <span className="font-bold text-emerald-400 block font-pixel">Lv. {existingProfile.level}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">지구 온도</span>
                <span className="font-bold text-rose-400 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 inline" />
                  +{existingProfile.earthTemp.toFixed(2)}°C
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">누적 점수</span>
                <span className="font-bold text-yellow-300 block">{existingProfile.score.toLocaleString()}점</span>
              </div>
            </div>

            {Boolean(existingProfile.isWorld2Unlocked || existingProfile.level > 50 || existingProfile.isMaster || (existingProfile.highestLevel && existingProfile.highestLevel > 50)) && (
              <button
                id="btn-login-world2"
                type="button"
                onClick={() => {
                  sound.playMilestoneBonus();
                  onStartGame({
                    ...existingProfile,
                    currentWorld: 2,
                    isWorld2Unlocked: true,
                  });
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg font-pixel border border-emerald-300"
              >
                <Globe2 className="w-4 h-4" />
                <span>🌍 [제2세계: 기후 회복 에코 월드 꾸미기] 바로가기</span>
              </button>
            )}

            <div className="flex gap-2 pt-1">
              <button
                id="btn-resume-game"
                type="button"
                onClick={() => handleStart(true)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg font-pixel"
              >
                <Play className="w-4 h-4 fill-current" />
                이어서 계속하기 (Lv.{existingProfile.level})
              </button>
              <button
                id="btn-restart-game"
                type="button"
                onClick={() => handleStart(false)}
                className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="1단계부터 새로 시작"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                새로하기
              </button>
            </div>
          </div>
        )}

        {/* New Player / Customization Section */}
        {(!existingProfile || (searched && !existingProfile)) && (
          <div className="space-y-4">
            {searched && !existingProfile && (
              <div className="text-xs text-sky-400 bg-sky-950/50 p-2.5 rounded-lg border border-sky-800/80 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <span>새로운 관리코드입니다. 나만의 캐릭터와 닉네임을 정해주세요!</span>
              </div>
            )}

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                탐험가 닉네임
              </label>
              <input
                id="input-nickname"
                type="text"
                placeholder="닉네임을 입력하세요 (예: 맑은바다)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Character Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                캐릭터 선택 (픽셀 히어로)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Male Hero */}
                <button
                  id="btn-select-male"
                  type="button"
                  onClick={() => setGender('male')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <canvas
                    ref={maleCanvasRef}
                    width={80}
                    height={80}
                    className="pixel-art drop-shadow-md"
                  />
                  <span className="text-xs font-bold text-white font-pixel">남학생 탐험가</span>
                  <span className="text-[10px] text-slate-400">마리오 스타일 에코 오버롤</span>
                </button>

                {/* Female Hero */}
                <button
                  id="btn-select-female"
                  type="button"
                  onClick={() => setGender('female')}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <canvas
                    ref={femaleCanvasRef}
                    width={80}
                    height={80}
                    className="pixel-art drop-shadow-md"
                  />
                  <span className="text-xs font-bold text-white font-pixel">여학생 탐험가</span>
                  <span className="text-[10px] text-slate-400">청록빛 친환경 바이저 히어로</span>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              id="btn-start-new"
              type="button"
              disabled={!manageCode.trim()}
              onClick={() => handleStart(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xl cursor-pointer font-pixel"
            >
              <Play className="w-4 h-4 fill-current" />
              게임 시작하기
            </button>
          </div>
        )}

        {/* Quick Links: Storytelling, Certification Board, and Shop */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            id="btn-login-story"
            type="button"
            onClick={() => {
              sound.playJump();
              setShowStory(true);
            }}
            className="py-2 px-2 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/50 text-sky-300 text-[11px] font-pixel flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="기후위기 & 지구열화 스토리텔링"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">스토리텔링</span>
          </button>

          <button
            id="btn-login-cert"
            type="button"
            onClick={() => {
              sound.playCoin();
              setShowCert(true);
            }}
            className="py-2 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 text-[11px] font-pixel flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="친환경 실천 인증소 및 캡처"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">실천 인증소</span>
          </button>

          <button
            id="btn-login-shop"
            type="button"
            onClick={() => {
              sound.playCoin();
              setShowShop(true);
            }}
            className="py-2 px-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 text-[11px] font-pixel flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="무기 및 스킬 상점 (상시 이용 가능)"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">무기 상점</span>
          </button>
        </div>

        {/* Educational Game Rules Overview */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-300">🎮 조작 및 핵심 미션:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
            <li><strong className="text-slate-300">방향키(← →) / A, D</strong>: 좌우 이동 | <strong className="text-slate-300">Space / ↑</strong>: 점프 | <strong className="text-slate-300">F / Enter</strong>: 무기 발사</li>
            <li><span className="text-rose-400 font-semibold">자가용, 매연 등 변수 충돌 시</span>: 바닷물이 차오름 (전신 잠기면 게임오버!)</li>
            <li><span className="text-emerald-400 font-semibold">씨앗 & 재생에너지 획득 시</span>: 나무가 자라며 바닷물 높이가 줄어듦!</li>
            <li><span className="text-yellow-400 font-semibold">10단위 레벨 돌파 시</span>: 보너스 코인 즉시 대량 지급!</li>
            <li><span className="text-amber-300 font-semibold">무기/스킬 상점</span>: 레벨 제한 없이 상시 이용 가능 (에코 코인으로 무기 잠금해제)</li>
            <li><span className="text-emerald-300 font-semibold">50레벨 완료 시</span>: 기후위기 마스터 달성 & [제2세계: 기후 회복 에코 월드] 대개방!</li>
            <li><span className="text-teal-300 font-semibold">제2세계 에코 월드</span>: 기후위기 대응 친환경 인프라(블루카본, 해상풍력, DAC 등)로 나만의 생태계 복원</li>
          </ul>
        </div>
      </div>

      {/* Storytelling Modal */}
      {showStory && (
        <StoryModal onClose={() => setShowStory(false)} />
      )}

      {/* Certification Modal */}
      {showCert && (
        <CertificationModal
          profile={existingProfile || {
            manageCode: manageCode.trim() || 'ECO-VISITOR',
            nickname: nickname.trim() || '예비 기후탐험가',
            gender: gender,
            level: 1,
            score: 0,
            earthTemp: 1.2,
            coins: 0,
            lastPlayedAt: new Date().toISOString(),
            unlockedSkills: [],
            highestLevel: 1,
            isMaster: false,
          }}
          onClose={() => setShowCert(false)}
        />
      )}

      {/* Shop Modal */}
      {showShop && (
        <ShopModal
          profile={existingProfile || {
            manageCode: manageCode.trim() || 'ECO-VISITOR',
            nickname: nickname.trim() || '예비 기후탐험가',
            gender: gender,
            level: 1,
            score: 0,
            earthTemp: 1.2,
            coins: 10,
            lastPlayedAt: new Date().toISOString(),
            unlockedSkills: [],
            highestLevel: 1,
            isMaster: false,
          }}
          onUpdateProfile={(updated) => {
            if (existingProfile) {
              setExistingProfile(updated);
            }
          }}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  );
}
