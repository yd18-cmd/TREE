import { useState, useMemo } from 'react';
import type { StudentProfile } from '../types';
import { CLIMATE_QUIZZES } from '../data/quizData';
import { sound } from '../lib/audio';
import { 
  HelpCircle, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  X,
  Sparkles 
} from 'lucide-react';

interface QuizModalProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onClose: () => void;
}

export function QuizModal({ profile, onUpdateProfile, onClose }: QuizModalProps) {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [bonusEarned, setBonusEarned] = useState<number>(0);

  const solvedIds = useMemo(() => new Set(profile.solvedQuizIds || []), [profile.solvedQuizIds]);

  // Filter questions for the selected tier
  const tierQuestions = useMemo(() => {
    return CLIMATE_QUIZZES.filter((q) => q.tier === selectedTier);
  }, [selectedTier]);

  const currentQ = tierQuestions[currentQuestionIndex] || tierQuestions[0];
  const isAlreadySolved = currentQ ? solvedIds.has(currentQ.id) : false;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQ) return;

    setIsAnswered(true);
    const correct = selectedOption === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playQuizCorrect();
      // Award coins if not previously solved
      if (!isAlreadySolved) {
        const reward = currentQ.coinReward;
        const updatedSolved = [...(profile.solvedQuizIds || []), currentQ.id];
        const newCoinTotal = profile.coins + reward;
        const newScore = profile.score + reward * 50;

        setBonusEarned((prev) => prev + reward);
        onUpdateProfile({
          ...profile,
          coins: newCoinTotal,
          score: newScore,
          solvedQuizIds: updatedSolved,
          lastPlayedAt: new Date().toISOString(),
        });
      }
    } else {
      sound.playQuizWrong();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);

    if (currentQuestionIndex < tierQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      sound.playJump();
    } else {
      // Finished tier questions, wrap or notify
      if (selectedTier < 5) {
        setSelectedTier((t) => t + 1);
        setCurrentQuestionIndex(0);
        sound.playMilestoneBonus();
      } else {
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
  };

  const handleSwitchTier = (tier: number) => {
    sound.playCoin();
    setSelectedTier(tier);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
  };

  const tierMeta = [
    { tier: 1, label: '1단계: 초급', reward: '+3 코인', desc: '온실가스 기초' },
    { tier: 2, label: '2단계: 중급', reward: '+5 코인', desc: '해수면 & 빙하' },
    { tier: 3, label: '3단계: 고급', reward: '+8 코인', desc: '탄소중립 & 재생에너지' },
    { tier: 4, label: '4단계: 심화', reward: '+12 코인', desc: '지구열화 메커니즘' },
    { tier: 5, label: '5단계: 마스터', reward: '+20 코인', desc: '기후 임계점 & 행동' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-3 border-amber-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400">
              <HelpCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-pixel font-bold text-white flex items-center gap-2">
                기후위기 탐구 퀴즈 센터
                <span className="text-xs text-amber-300 font-normal">코인 획득 연구실</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                문제를 단계별로 맞히고 에코 코인을 획득하여 무기와 장비를 구입하세요!
              </p>
            </div>
          </div>

          <button
            id="btn-close-quiz"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Student Coins & Bonus info */}
        <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 my-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">내 보유 코인:</span>
            <span className="text-sm font-pixel text-yellow-300 flex items-center gap-1">
              <Coins className="w-4 h-4 fill-yellow-400 text-yellow-500" />
              {profile.coins} 코인
            </span>
          </div>

          {bonusEarned > 0 && (
            <div className="text-xs font-pixel text-emerald-400 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              이번 퀴즈로 +{bonusEarned} 코인 획득!
            </div>
          )}
        </div>

        {/* Tier Selector Buttons */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-4">
          {tierMeta.map((m) => {
            const isSelected = selectedTier === m.tier;
            return (
              <button
                key={m.tier}
                id={`btn-quiz-tier-${m.tier}`}
                type="button"
                onClick={() => handleSwitchTier(m.tier)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className={`text-[10px] sm:text-xs font-pixel block ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                  {m.tier}단계
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-400 font-pixel">
                  {m.reward}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Question Container */}
        {currentQ && (
          <div className="bg-black/50 rounded-xl p-4 sm:p-5 border-2 border-slate-700 flex-1 flex flex-col justify-between">
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-pixel font-bold">
                  {currentQ.tierName} · 문제 {currentQuestionIndex + 1}/{tierQuestions.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-yellow-300 font-pixel flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    +{currentQ.coinReward} 코인
                  </span>
                  {isAlreadySolved && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                      <Award className="w-3 h-3" />
                      풀이 완료
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-400/80';
                  
                  if (selectedOption === idx) {
                    btnStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold';
                  }

                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold';
                    } else if (selectedOption === idx && !isCorrect) {
                      btnStyle = 'bg-rose-500/25 border-rose-400 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-opt-${idx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 font-pixel">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Result & Explanation */}
            {isAnswered && (
              <div className={`mt-4 p-3.5 rounded-xl border animate-fade-in ${
                isCorrect 
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200' 
                  : 'bg-rose-950/60 border-rose-500/80 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm font-bold mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>정답입니다! {isAlreadySolved ? '(이미 획득 완료)' : `+${currentQ.coinReward} 코인이 지급되었습니다!`}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>아쉽습니다! 다시 도전해보세요.</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5 pl-6">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-800">
              {!isAnswered ? (
                <button
                  id="btn-submit-answer"
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-pixel text-xs font-bold rounded-xl cursor-pointer shadow-lg transition-transform active:scale-95"
                >
                  정답 제출하기
                </button>
              ) : (
                <div className="flex gap-2">
                  {!isCorrect && (
                    <button
                      id="btn-retry-quiz"
                      type="button"
                      onClick={handleRetryQuestion}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      다시 풀기
                    </button>
                  )}
                  <button
                    id="btn-next-quiz"
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
                  >
                    <span>다음 문제</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
