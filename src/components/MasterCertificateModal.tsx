import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { sound } from '../lib/audio';

interface MasterCertificateModalProps {
  nickname: string;
  manageCode: string;
  score: number;
  earthTemp: number;
  onOpenShop: () => void;
  onContinueGame: () => void;
  onOpenCert?: () => void;
  onOpenWorld2?: () => void;
}

export function MasterCertificateModal({
  nickname,
  manageCode,
  score,
  earthTemp,
  onOpenShop,
  onContinueGame,
  onOpenCert,
  onOpenWorld2,
}: MasterCertificateModalProps) {
  useEffect(() => {
    sound.playLevelClear();
    // Launch celebratory confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-4 border-yellow-400/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center text-white">
        {/* Decorative corner ribbons */}
        <div className="absolute top-2 left-2 text-yellow-400 text-lg">✦</div>
        <div className="absolute top-2 right-2 text-yellow-400 text-lg">✦</div>
        <div className="absolute bottom-2 left-2 text-yellow-400 text-lg">✦</div>
        <div className="absolute bottom-2 right-2 text-yellow-400 text-lg">✦</div>

        {/* Big Trophy / Emblem */}
        <div className="w-20 h-20 mx-auto mb-4 bg-yellow-400/20 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
          <Award className="w-10 h-10 text-yellow-300 animate-pulse" />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 border border-yellow-400/50 rounded-full text-yellow-300 text-xs font-pixel mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          50단계 전 구간 완전 정복 달성!
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-yellow-300 font-pixel tracking-wide mb-1">
          기후위기 막기 마스터
        </h2>
        <p className="text-xs text-emerald-300 font-medium mb-5">
          Master Climate Savior Certificate
        </p>

        {/* Certificate Frame */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-2xl p-4 mb-6 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">수여자 (닉네임):</span>
            <span className="text-white font-bold">{nickname} 학생</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">관리코드 (식별자):</span>
            <span className="text-emerald-400 font-bold">{manageCode}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="text-slate-400">누적 환경 점수:</span>
            <span className="text-yellow-300 font-bold">{score.toLocaleString()} 점</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">지구 온도 방어율:</span>
            <span className="text-cyan-300 font-bold">+{earthTemp.toFixed(2)}°C 안착 (빙하 보호)</span>
          </div>
          <p className="text-[11px] text-slate-300 pt-2 text-center italic border-t border-slate-800">
            “귀하는 50개의 탄소 배출 시련을 극복하고 바다의 해수면 상승을 훌륭히 저지하였으므로 이 칭호를 수여합니다.”
          </p>
        </div>

        {/* World 2 Unlock Announcement Banner */}
        <div className="bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl p-3.5 mb-5 text-xs text-emerald-200 flex items-start gap-3 text-left animate-pulse">
          <ShieldCheck className="w-6 h-6 text-emerald-300 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-300 font-pixel text-sm">
              🌍 [제2세계: 기후 회복 에코 월드] 대개방!
            </strong>
            <span>
              50개 스테이지를 완주하여 <strong>제2세계 월드 꾸미기</strong>가 열렸습니다! 오직 기후위기 극복을 위한 블루카본 맹그로브, 해상풍력, DAC 탄소포집 시설을 배치하여 나만의 에코 생태계를 가꿔보세요.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {onOpenWorld2 && (
            <button
              id="btn-master-open-world2"
              type="button"
              onClick={() => {
                sound.playMilestoneBonus();
                onOpenWorld2();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl font-pixel cursor-pointer transition-transform active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>제2세계 에코 월드 꾸미기 입장하기!</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {onOpenCert && (
              <button
                id="btn-master-cert-capture"
                type="button"
                onClick={() => {
                  sound.playCoin();
                  onOpenCert();
                }}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow font-pixel cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                인증서 캡처
              </button>
            )}
            <button
              id="btn-open-shop"
              onClick={() => {
                sound.playCoin();
                onOpenShop();
              }}
              className="flex-1 py-2.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow font-pixel cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              무기/스킬 상점
            </button>
            <button
              id="btn-continue-game"
              onClick={() => {
                sound.playJump();
                onContinueGame();
              }}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow font-pixel cursor-pointer"
            >
              1세계 계속하기 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
