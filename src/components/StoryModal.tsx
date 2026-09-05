import { useState, useEffect, useRef } from 'react';
import type { StoryVersion } from '../types';
import { sound } from '../lib/audio';
import { BookOpen, Volume2, VolumeX, FastForward, Play, Flame, Waves, CheckCircle2 } from 'lucide-react';

interface StoryModalProps {
  onClose: () => void;
  initialVersion?: StoryVersion;
}

interface StorySegment {
  title: string;
  badge: string;
  icon: string;
  content: string;
  keyFact: string;
}

const STORIES: Record<StoryVersion, StorySegment[]> = {
  climate_crisis: [
    {
      title: '바다의 경고와 해수면 상승',
      badge: '기후위기 편',
      icon: '🌊',
      content:
        '1850년대 산업혁명 이후 인류는 석탄과 석유 등 화석연료를 태우며 눈부신 문명을 세웠습니다.\n\n하지만 그 대가로 대기 중 이산화탄소 농도는 420ppm을 돌파했고, 지구의 평균 기온은 이미 1.2°C 이상 가파르게 치솟았습니다.\n\n남극과 북극의 거대한 빙하가 녹아내리고 따뜻해진 바닷물이 부피를 부풀리면서, 전 세계 해수면이 매년 빠른 속도로 상승하고 있습니다.',
      keyFact: '💡 지구 온도가 1.5°C 오르면 전 세계 해수면이 최대 1m 이상 상승하여 수많은 해안 도시가 물에 잠깁니다.',
    },
    {
      title: '우리의 삶의 터전이 잠긴다',
      badge: '기후위기 편',
      icon: '🏝️',
      content:
        '남태평양의 아름다운 섬나라 투발루와 키리바시는 이미 국토 전체가 영구 침수될 위기에 처해 있습니다.\n\n대한민국을 비롯한 전 세계 해안 도시들 역시 잦아진 슈퍼 태풍과 만조 수위 상승으로 방파제를 넘는 바닷물에 위협받고 있습니다.\n\n탄소 배출 변수를 막지 못하면, 우리가 딛고 선 이 땅마저 푸른 바닷물 속으로 영원히 가라앉고 말 것입니다.',
      keyFact: '💡 내연기관 자동차, 무분별한 공장 매연, 산림 벌채가 해수면 상승을 부추기는 주범입니다.',
    },
    {
      title: '에코 히어로의 출격: 나무를 심어라!',
      badge: '기후위기 편',
      icon: '🌱',
      content:
        '지금 우리에게 필요한 것은 행동입니다!\n\n도로 위를 달리는 내연기관 차량의 매연과 공장 굴뚝의 온실가스 구름을 피해 목적지 기후 연구소로 달려가세요.\n\n맵 곳곳에 떨어진 [생명의 씨앗]을 모아 나무를 심으면, 나무가 이산화탄소를 흡수하고 수분을 머금어 차오르던 바닷물의 수위를 극적으로 낮출 수 있습니다!\n\n바닷물이 당신의 머리끝까지 차오르기 전에, 지구를 구해주세요!',
      keyFact: '💡 한 그루의 건강한 나무는 연간 약 22kg의 이산화탄소를 흡수하는 최고의 천연 탄소흡수원입니다.',
    },
  ],
  global_boiling: [
    {
      title: '온난화의 종말, 끓어오르는 지구',
      badge: '지구열화 편',
      icon: '🔥',
      content:
        '"지구 온난화(Global Warming)의 시대는 끝났습니다.\n이제는 지구가 펄펄 끓어오르는 [지구 열화(Global Boiling)]의 시대입니다."\n\n2023년 UN 사무총장 안토니우 구테흐스의 충격적인 경고처럼, 전 세계는 관측 사상 가장 뜨거운 여름을 연속으로 경신하고 있습니다.\n\n살인적인 폭염, 끝없는 산불, 바다가 열탕으로 변하는 해양 열파가 생명체들의 숨을 멎게 하고 있습니다.',
      keyFact: '💡 2024년 여름, 전 세계 수많은 지역의 체감 온도가 50°C를 돌파하며 기후 재난이 일상이 되었습니다.',
    },
    {
      title: '지구열화 빙하거인의 각성',
      badge: '지구열화 편',
      icon: '👹',
      content:
        '영원할 것 같던 북극의 빙하가 무너지며, 갇혀 있던 지구열화의 저주가 [빙하거인]이라는 괴물로 형상화되었습니다!\n\n빙하거인은 5단계마다 나타나 펄펄 끓는 온실가스 열파 탄환을 사방으로 뿜어내며 바닷물을 폭발적으로 증발시키고 해수면을 끌어올립니다.\n\n기후 임계점인 +1.5°C를 넘어서면 영구동토층이 녹아 막대한 양의 메탄가스가 폭발하듯 뿜어져 나와 인류의 제어 능력을 완전히 벗어나게 됩니다.',
      keyFact: '💡 기후 임계점(Tipping Point)을 넘기면 자연 스스로가 온실가스를 내뿜는 폭주 온실효과가 일어납니다.',
    },
    {
      title: '재생에너지와 1.5°C 수호 미션',
      badge: '지구열화 편',
      icon: '⚡',
      content:
        '태양광과 풍력, 친환경 재생에너지의 힘을 결집하세요!\n\n에코 묘목을 심어 지구 열기를 식히고, 레벨 10단위마다 주어지는 특별 보너스와 기후 퀴즈로 코인을 모아 [태양광 광선총]과 [빙하 냉각기]를 갖추세요.\n\n지구열화 빙하거인을 정화하고 50레벨을 돌파하여 [기후위기 막기 마스터]로 거듭나세요!\n\n지구의 미래는 당신의 발걸음에 달려 있습니다!',
      keyFact: '💡 재생에너지 전환과 탄소중립 실천만이 끓어오르는 지구의 온도를 1.5°C 아래로 묶어둘 수 있습니다.',
    },
  ],
};

export function StoryModal({ onClose, initialVersion = 'climate_crisis' }: StoryModalProps) {
  const [version, setVersion] = useState<StoryVersion>(initialVersion);
  const [slideIndex, setSlideIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  const currentSlides = STORIES[version];
  const slide = currentSlides[slideIndex] || currentSlides[0];
  const fullText = slide.content;

  // Typewriter effect state
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset typing state on slide or version change
    setDisplayedText('');
    setIsTyping(true);

    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    let charIdx = 0;
    const speed = 25; // ms per char

    typingTimerRef.current = window.setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));

      // Play typing click sound every 2 characters for pleasant rhythm
      if (soundOn && charIdx % 2 === 0) {
        sound.playTypewriterClick();
      }

      if (charIdx >= fullText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, speed);

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [slideIndex, version, fullText, soundOn]);

  const handleSkipTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedText(fullText);
    setIsTyping(false);
    if (soundOn) sound.playTypewriterClick();
  };

  const handleNextSlide = () => {
    if (slideIndex < currentSlides.length - 1) {
      setSlideIndex((prev) => prev + 1);
      sound.playJump();
    } else {
      sound.playLevelClear();
      onClose();
    }
  };

  const handleSwitchVersion = (newVersion: StoryVersion) => {
    if (version === newVersion) return;
    sound.playCoin();
    setVersion(newVersion);
    setSlideIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-3 border-emerald-500/80 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Retro Header Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-pixel text-xs sm:text-sm font-bold text-white tracking-wider">
              기후 스토리텔링 모니터
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              id="btn-story-sound-toggle"
              type="button"
              onClick={() => setSoundOn((s) => !s)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              title={soundOn ? '타자 소리 끄기' : '타자 소리 켜기'}
            >
              {soundOn ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] hidden sm:inline">타자음 켬</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] hidden sm:inline">타자음 끔</span>
                </>
              )}
            </button>

            {/* Fast-Forward / Skip typing */}
            {isTyping && (
              <button
                id="btn-story-skip"
                type="button"
                onClick={handleSkipTyping}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-pixel flex items-center gap-1 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span className="text-[10px]">전체 보기</span>
              </button>
            )}
          </div>
        </div>

        {/* Version Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <button
            id="tab-story-climate-crisis"
            type="button"
            onClick={() => handleSwitchVersion('climate_crisis')}
            className={`py-2.5 px-3 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              version === 'climate_crisis'
                ? 'bg-sky-600 text-white border-2 border-sky-300 shadow-md shadow-sky-600/30 font-bold'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4 text-cyan-300" />
            <span>기후위기 편 (해수면 상승)</span>
          </button>

          <button
            id="tab-story-global-boiling"
            type="button"
            onClick={() => handleSwitchVersion('global_boiling')}
            className={`py-2.5 px-3 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              version === 'global_boiling'
                ? 'bg-rose-600 text-white border-2 border-rose-300 shadow-md shadow-rose-600/30 font-bold'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>지구열화 편 (끓는 지구)</span>
          </button>
        </div>

        {/* Story Body Terminal Screen */}
        <div className="flex-1 bg-black/60 rounded-xl p-4 sm:p-6 border-2 border-slate-700 font-mono relative min-h-[220px] flex flex-col justify-between">
          <div>
            {/* Badge & Title */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{slide.icon}</span>
              <div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-pixel uppercase tracking-wider ${
                    version === 'climate_crisis'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {slide.badge} · {slideIndex + 1}/{currentSlides.length}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white font-pixel mt-0.5">
                  {slide.title}
                </h2>
              </div>
            </div>

            {/* Typewriter Output Text */}
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line min-h-[120px]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />
              )}
            </div>
          </div>

          {/* Key Fact Card */}
          <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] sm:text-xs text-amber-200">
            {slide.keyFact}
          </div>
        </div>

        {/* Bottom Pagination & Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="flex gap-1.5">
            {currentSlides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === slideIndex
                    ? 'w-6 bg-emerald-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slideIndex > 0 && (
              <button
                id="btn-story-prev"
                type="button"
                onClick={() => {
                  setSlideIndex((prev) => Math.max(0, prev - 1));
                  sound.playJump();
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-pixel rounded-lg cursor-pointer"
              >
                이전
              </button>
            )}

            <button
              id="btn-story-next"
              type="button"
              onClick={handleNextSlide}
              className={`px-5 py-2.5 rounded-xl font-pixel text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg ${
                slideIndex === currentSlides.length - 1
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {slideIndex === currentSlides.length - 1 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  스토리 확인 완료 (게임하기)
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  다음 이야기 ({slideIndex + 1}/{currentSlides.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
