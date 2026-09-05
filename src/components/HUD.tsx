import { 
  Flame, 
  Droplets, 
  Coins, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Music, 
  ShoppingBag,
  Sprout,
  HelpCircle,
  BookOpen,
  Camera,
  Globe2
} from 'lucide-react';
import type { StudentProfile } from '../types';

interface HUDProps {
  profile: StudentProfile;
  waterLevelPct: number; // 0% to 100%
  earthTemp: number; // e.g. 1.25 °C
  seedCount: number;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  isPaused: boolean;
  onToggleSound: () => void;
  onToggleBgm: () => void;
  onTogglePause: () => void;
  onOpenShop?: () => void;
  onOpenQuiz?: () => void;
  onOpenStory?: () => void;
  onOpenCert?: () => void;
  onOpenWorld2?: () => void;
  canShoot?: boolean;
}

export function HUD({
  profile,
  waterLevelPct,
  earthTemp,
  seedCount,
  soundEnabled,
  bgmEnabled,
  isPaused,
  onToggleSound,
  onToggleBgm,
  onTogglePause,
  onOpenShop,
  onOpenQuiz,
  onOpenStory,
  onOpenCert,
  onOpenWorld2,
  canShoot
}: HUDProps) {
  const isHighDanger = waterLevelPct > 70;
  const isMediumDanger = waterLevelPct > 40;

  return (
    <header className="w-full bg-slate-900/95 border-b-2 border-slate-700/80 px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5 text-white backdrop-blur-md select-none z-30">
      {/* Left: Level & Profile Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-pixel text-[11px] sm:text-xs font-bold">
              {profile.isMaster || profile.level > 50 ? '🌟 MASTER' : `LV. ${profile.level}`}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate max-w-[100px] sm:max-w-[140px]">
              {profile.nickname}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            코드: {profile.manageCode}
          </span>
        </div>

        {/* Score & Coins */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="hidden sm:block text-xs font-mono">
            <span className="text-slate-400 block text-[10px]">점수</span>
            <span className="text-yellow-300 font-bold">{profile.score.toLocaleString()}</span>
          </div>
          <button
            id="hud-btn-coins"
            type="button"
            onClick={onOpenQuiz}
            className="flex items-center gap-1 bg-yellow-950/60 hover:bg-yellow-900/60 border border-yellow-500/50 px-2 py-1 rounded-lg text-xs font-pixel text-yellow-300 transition-colors cursor-pointer"
            title="코인 추가 획득 (기후 퀴즈 풀기)"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>{profile.coins}</span>
            <span className="text-[10px] text-amber-400 underline decoration-dotted hidden md:inline ml-0.5">+코인</span>
          </button>
        </div>
      </div>

      {/* Center: Real-time Climate Indicators (Data Reflecting Rules) */}
      <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-md justify-center">
        {/* Earth Temperature Gauge */}
        <div className="flex items-center gap-2 min-w-[110px] sm:min-w-[130px]">
          <Flame className={`w-4 h-4 ${earthTemp >= 2.0 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-mono leading-none mb-1">
              <span className="text-slate-400 hidden xs:inline">기온</span>
              <span className={`font-bold ${earthTemp >= 1.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                +{earthTemp.toFixed(2)}°C
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className={`h-full transition-all duration-300 ${
                  earthTemp >= 2.0 ? 'bg-rose-500' : earthTemp >= 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, ((earthTemp - 1.0) / 1.5) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sea Level Rise Gauge (Critical Metric) */}
        <div className="flex items-center gap-2 min-w-[110px] sm:min-w-[130px]">
          <Droplets className={`w-4 h-4 ${isHighDanger ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-mono leading-none mb-1">
              <span className="text-slate-400 hidden xs:inline">해수면</span>
              <span className={`font-bold ${isHighDanger ? 'text-rose-400' : isMediumDanger ? 'text-amber-400' : 'text-cyan-400'}`}>
                {Math.round(waterLevelPct)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div 
                className={`h-full transition-all duration-300 ${
                  isHighDanger ? 'bg-rose-500' : isMediumDanger ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, waterLevelPct))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Seed Count */}
        <div className="hidden lg:flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/50 px-2 py-1 rounded-lg text-xs font-mono text-emerald-300">
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          <span>씨앗 {seedCount}</span>
        </div>
      </div>

      {/* Right: Feature Modals & Audio Controls */}
      <div className="flex items-center gap-1.5">
        {/* Climate Quiz Button */}
        {onOpenQuiz && (
          <button
            id="hud-btn-quiz"
            onClick={onOpenQuiz}
            className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 text-xs font-pixel flex items-center gap-1 cursor-pointer transition-colors"
            title="기후 퀴즈 풀고 코인 얻기"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">퀴즈 (+코인)</span>
          </button>
        )}

        {/* Storytelling Button */}
        {onOpenStory && (
          <button
            id="hud-btn-story"
            onClick={onOpenStory}
            className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/70 text-sky-300 text-xs font-pixel flex items-center gap-1 cursor-pointer transition-colors"
            title="기후위기 & 지구열화 스토리"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">스토리</span>
          </button>
        )}

        {/* Certification / Capture Button */}
        {onOpenCert && (
          <button
            id="hud-btn-cert"
            onClick={onOpenCert}
            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/70 text-emerald-300 text-xs font-pixel flex items-center gap-1 cursor-pointer transition-colors"
            title="인증서 캡처 및 실천 다짐 등록"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">인증/캡처</span>
          </button>
        )}

        {/* Shop Button (Available at all levels) */}
        {onOpenShop && (
          <button
            id="hud-btn-shop"
            onClick={onOpenShop}
            className="px-2.5 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer font-pixel shadow-md border border-yellow-300 active:scale-95"
            title="무기/스킬 상점 (모든 레벨 이용 가능)"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="inline">상점</span>
          </button>
        )}

        {/* World 2 Button (if unlocked) or indicator */}
        {onOpenWorld2 && (profile.isWorld2Unlocked || profile.level > 50 || profile.isMaster || (profile.highestLevel && profile.highestLevel > 50)) ? (
          <button
            id="hud-btn-world2"
            onClick={onOpenWorld2}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-transform cursor-pointer font-pixel shadow-md active:scale-95 animate-pulse"
            title="제2세계: 기후 회복 에코 월드 꾸미기"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2세계 에코월드</span>
          </button>
        ) : (
          <div 
            className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 text-[10px] font-pixel"
            title="50레벨 완료 시 제2세계 에코 월드가 해금됩니다"
          >
            <Globe2 className="w-3 h-3 text-slate-500" />
            <span>2세계(Lv.50 해금)</span>
          </div>
        )}

        {/* Weapon indicator if unlocked */}
        {canShoot && (
          <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-pixel text-[10px]">
            ⚡[F] 공격
          </span>
        )}

        {/* Pause Button */}
        <button
          id="hud-btn-pause"
          onClick={onTogglePause}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          title={isPaused ? "게임 재개" : "일시정지"}
        >
          {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-current" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Sound FX Toggle */}
        <button
          id="hud-btn-sound"
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            soundEnabled ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
          }`}
          title="효과음 켜기/끄기"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* 8-bit BGM Toggle */}
        <button
          id="hud-btn-bgm"
          onClick={onToggleBgm}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            bgmEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
          }`}
          title="8비트 BGM 음악 켜기/끄기"
        >
          <Music className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

