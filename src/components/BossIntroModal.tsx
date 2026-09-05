import { Flame, ShieldAlert } from 'lucide-react';
import { sound } from '../lib/audio';

interface BossIntroModalProps {
  level: number;
  onStartBattle: () => void;
}

export function BossIntroModal({ level, onStartBattle }: BossIntroModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-rose-950 to-slate-950 border-4 border-rose-500 rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden">
        {/* Warning siren background effect */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500 animate-pulse" />

        <div className="w-16 h-16 mx-auto mb-3 bg-rose-500/20 border-2 border-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
          <ShieldAlert className="w-8 h-8 text-rose-400 animate-bounce" />
        </div>

        <span className="px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400 text-rose-300 text-xs font-pixel inline-block mb-2">
          ⚠️ 비상 기후 경보 발령!
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-white font-pixel mb-1 tracking-wide">
          지구열화 빙하거인 출현!
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs text-rose-200 font-medium font-pixel">
            Level {level} Boss
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-900/80 border border-rose-400 text-rose-300 text-[11px] font-pixel font-bold">
            체력(HP): {level >= 50 ? 5000 : (400 + level * 70)}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-300 text-left space-y-2 mb-5 leading-relaxed">
          <p className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            보스 특성 및 공략법:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
            <li>빙하거인이 온실가스 탄환을 발사하며 바닷물을 끓어오르게 합니다.</li>
            <li>맵에 나타나는 <strong>씨앗과 재생에너지</strong>를 획득하여 나무를 심고, 거인의 공격을 점프로 회피하세요!</li>
            <li>[F] 키 또는 공격 버튼(무기 소지 시)이나 거인의 머리를 점프로 밟아 정화할 수 있습니다.</li>
          </ul>
        </div>

        <button
          onClick={() => {
            sound.playHit();
            onStartBattle();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-xl font-pixel cursor-pointer transition-transform active:scale-98"
        >
          보스전 시작하기!
        </button>
      </div>
    </div>
  );
}
