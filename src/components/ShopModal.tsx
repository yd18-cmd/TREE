import type { StudentProfile, ShopSkill } from '../types';
import { sound } from '../lib/audio';
import { ShoppingBag, X, Check, Coins, Zap } from 'lucide-react';

interface ShopModalProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onClose: () => void;
}

export const SHOP_ITEMS: ShopSkill[] = [
  {
    id: 'solar_weapon',
    name: '태양광 광선총 (Solar Cannon)',
    icon: '⚡',
    desc: '[무기] F키 또는 공격 버튼으로 앞을 가로막는 자가용/탄소배출 변수를 원거리 정화!',
    price: 35,
    category: 'weapon',
  },
  {
    id: 'hyper_seed',
    name: '초고속 생장 묘목 (Hyper Seed)',
    icon: '🌳',
    desc: '[스킬] 씨앗 획득 시 거목이 자라며 해수면 하강 및 지구 냉각 효과 2배 증폭!',
    price: 30,
    category: 'passive',
  },
  {
    id: 'aero_shield',
    name: '에어로 정화 쉴드 (Aero Shield)',
    icon: '🛡️',
    desc: '[스킬] 변수와 충돌해도 바닷물 유입을 1회 완벽히 막아내는 보호막!',
    price: 25,
    category: 'active',
  },
  {
    id: 'wind_boots',
    name: '바람의 에코 부츠 (Wind Boots)',
    icon: '🥾',
    desc: '[장비] 이동속도 25% 상승 및 더욱 가볍고 높은 친환경 점프력 제공!',
    price: 40,
    category: 'passive',
  },
  {
    id: 'cryo_freeze',
    name: '빙하 보호 냉각기 (Cryo Freeze)',
    icon: '❄️',
    desc: '[무기/스킬] 빙하거인의 열기를 즉시 식히고 바닷물을 일시적으로 동결!',
    price: 50,
    category: 'weapon',
  },
];

export function ShopModal({ profile, onUpdateProfile, onClose }: ShopModalProps) {
  const currentSkills = profile.unlockedSkills || [];

  const handleBuy = (item: ShopSkill) => {
    if (currentSkills.includes(item.id)) return;
    if (profile.coins < item.price) {
      sound.playHit();
      return;
    }

    sound.playCoin();
    const updated: StudentProfile = {
      ...profile,
      coins: profile.coins - item.price,
      unlockedSkills: [...currentSkills, item.id],
    };
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-yellow-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-base font-bold text-white font-pixel">
                기후위기 무기 & 스킬 상점
              </h3>
              <p className="text-[11px] text-emerald-400 font-semibold">
                [모든 레벨 이용 가능] 에코 코인을 모아 첨단 기후 보호 장비와 스킬을 잠금해제하세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 border border-yellow-400/60 rounded-full font-pixel text-xs text-yellow-300">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{profile.coins} 코인</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {SHOP_ITEMS.map((item) => {
            const isOwned = currentSkills.includes(item.id);
            const canAfford = profile.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border-2 flex items-center gap-3.5 transition-all ${
                  isOwned
                    ? 'bg-emerald-950/30 border-emerald-500/50'
                    : canAfford
                    ? 'bg-slate-800/80 border-slate-700 hover:border-yellow-400/60'
                    : 'bg-slate-900/50 border-slate-800 opacity-80'
                }`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {item.icon}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-pixel truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {item.desc}
                  </p>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {isOwned ? (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-pixel text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      장착됨
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3 py-2 rounded-xl font-pixel text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.price} 코인</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-pixel">
            <Zap className="w-3.5 h-3.5" /> 구매한 무기와 스킬은 즉시 게임에 적용됩니다
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg font-pixel cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
