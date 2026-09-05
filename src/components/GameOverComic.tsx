import { useState } from 'react';
import { RotateCcw, AlertTriangle, ArrowRight, ArrowLeft, Droplets, BookOpen, Home } from 'lucide-react';
import { sound } from '../lib/audio';

interface GameOverComicProps {
  level: number;
  earthTemp: number;
  score: number;
  onRetry: () => void;
  onHome: () => void;
}

interface ComicCut {
  step: number;
  title: string;
  subtitle: string;
  imageIcon: string;
  dialogue: string;
  dataNote: string;
  bgColor: string;
  borderColor: string;
}

export function GameOverComic({ level, earthTemp, score, onRetry, onHome }: GameOverComicProps) {
  const [currentCut, setCurrentCut] = useState(0);

  const cuts: ComicCut[] = [
    {
      step: 1,
      title: "1화: 끝없이 뿜어지는 탄소",
      subtitle: "화석연료와 내연기관의 과도한 사용",
      imageIcon: "🚗🏭💨",
      dialogue: "“자가용과 공장이 뿜어내는 온실가스는 지구의 대기를 두꺼운 담요처럼 감싸 열을 가둡니다...”",
      dataNote: "💡 기후 데이터: 현재 대기 중 CO₂ 농도는 420ppm을 초과하여 산업화 이전 대비 50% 이상 급증했습니다.",
      bgColor: "from-slate-900 to-amber-950",
      borderColor: "border-amber-600/50"
    },
    {
      step: 2,
      title: "2화: 빙하의 눈물",
      subtitle: "지구열화로 무너지는 극지방 얼음",
      imageIcon: "🏔️💧🔥",
      dialogue: "“지구 기온이 오르자 수만 년 동안 지구를 지키던 빙하가 굉음을 내며 바다로 녹아내립니다!”",
      dataNote: "💡 기후 데이터: 매년 그린란드와 남극에서 약 4,000억 톤의 얼음이 영구 소실되고 있습니다.",
      bgColor: "from-slate-900 to-cyan-950",
      borderColor: "border-cyan-600/50"
    },
    {
      step: 3,
      title: "3화: 턱밑까지 차오른 바다",
      subtitle: "해수면 상승과 삶의 터전 침수",
      imageIcon: "🌊🏘️⚠️",
      dialogue: "“물은 멈추지 않고 차올라, 결국 캐릭터와 우리의 마을 전체를 집어삼키고 말았습니다...”",
      dataNote: "💡 기후 데이터: 해수면이 1m만 상승해도 전 세계 수억 명의 기후 난민이 발생하며 해안 도시가 수몰됩니다.",
      bgColor: "from-slate-900 to-blue-950",
      borderColor: "border-blue-600/50"
    },
    {
      step: 4,
      title: "4화: 아직 늦지 않았습니다!",
      subtitle: "지금 행동하면 바닷물을 되돌릴 수 있다",
      imageIcon: "🌱☀️🤝",
      dialogue: "“변수를 피하고 나무를 심으세요! 우리의 작은 실천이 해수면 상승을 멈출 수 있습니다!”",
      dataNote: "💡 실천 포인트: 나무 한 그루는 연간 22kg의 이산화탄소를 흡수하고 기온을 낮춰줍니다.",
      bgColor: "from-slate-900 to-emerald-950",
      borderColor: "border-emerald-500/60"
    }
  ];

  const cut = cuts[currentCut];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-rose-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in">
        
        {/* Header Alert Banner */}
        <div className="bg-rose-950/80 border-b border-rose-800/80 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <Droplets className="w-5 h-5 animate-bounce" />
            <span className="font-pixel text-sm sm:text-base font-bold">
              [경고] 해수면 완전 침수 — 게임 오버!
            </span>
          </div>
          <div className="text-xs text-rose-300 font-mono">
            도달: Lv.{level} | +{earthTemp.toFixed(2)}°C
          </div>
        </div>

        {/* Comic Strip Canvas Area */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1 text-amber-300 font-semibold font-pixel">
              <BookOpen className="w-4 h-4" />
              기후위기 경각심 4컷 만화
            </span>
            <div className="flex gap-1.5">
              {cuts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sound.playCoin();
                    setCurrentCut(i);
                  }}
                  className={`w-6 h-6 rounded-full text-[10px] font-pixel font-bold flex items-center justify-center transition-all cursor-pointer ${
                    currentCut === i
                      ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Active Comic Panel */}
          <div className={`p-4 sm:p-6 rounded-xl border-2 bg-gradient-to-b ${cut.bgColor} ${cut.borderColor} space-y-4 relative shadow-inner`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-pixel text-rose-400 font-bold block">
                  CUT #{cut.step}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {cut.title}
                </h3>
              </div>
              <span className="text-4xl sm:text-5xl filter drop-shadow">
                {cut.imageIcon}
              </span>
            </div>

            {/* Visual Pixel Graphic Simulation for the scene */}
            <div className="w-full h-32 sm:h-40 bg-slate-950/80 rounded-lg border border-slate-700/80 flex flex-col items-center justify-center relative overflow-hidden p-3">
              {cut.step === 1 && (
                <div className="text-center space-y-2">
                  <div className="text-3xl animate-pulse">🏭 🚗 🚚 🚗 🏭</div>
                  <div className="text-xs text-slate-400 font-mono">
                    ▲ 온실가스 배출량 연간 500억 톤 돌파
                  </div>
                </div>
              )}
              {cut.step === 2 && (
                <div className="text-center space-y-2">
                  <div className="text-3xl animate-bounce">🧊 💥 🌊 🌊</div>
                  <div className="text-xs text-cyan-300 font-mono">
                    ▲ 북극 해빙 면적 역대 최저치 경신
                  </div>
                </div>
              )}
              {cut.step === 3 && (
                <div className="text-center space-y-2">
                  <div className="text-3xl animate-pulse">🌊 🌊 🏠 🌊 🌊</div>
                  <div className="text-xs text-rose-300 font-mono">
                    ▲ 해수면 상승률 지난 세기 대비 2배 가속화
                  </div>
                </div>
              )}
              {cut.step === 4 && (
                <div className="text-center space-y-2">
                  <div className="text-3xl animate-bounce">🌱 🌳 🌲 ☀️ 🌏</div>
                  <div className="text-xs text-emerald-300 font-mono">
                    ▲ 숲 조성 & 재생에너지 전환으로 해수면 안정화
                  </div>
                </div>
              )}
            </div>

            {/* Speech Bubble */}
            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl relative">
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic">
                {cut.dialogue}
              </p>
            </div>

            {/* Scientific Data Note */}
            <div className="text-xs text-amber-200/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 font-mono">
              {cut.dataNote}
            </div>
          </div>

          {/* Navigation between cuts */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                sound.playCoin();
                setCurrentCut((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentCut === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer font-pixel"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 이전 컷
            </button>

            {currentCut < cuts.length - 1 ? (
              <button
                onClick={() => {
                  sound.playCoin();
                  setCurrentCut((prev) => Math.min(cuts.length - 1, prev + 1));
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer font-pixel"
              >
                다음 컷 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-pixel font-bold">
                ✓ 4컷 만화 완료!
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-gameover-retry"
            onClick={() => {
              sound.playJump();
              onRetry();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer font-pixel active:scale-98 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            다시 도전하기 (Lv.{level})
          </button>
          <button
            id="btn-gameover-home"
            onClick={() => {
              sound.playCoin();
              onHome();
            }}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            관리코드 홈으로
          </button>
        </div>

      </div>
    </div>
  );
}
