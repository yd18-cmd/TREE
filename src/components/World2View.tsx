import { useState, useMemo, useRef } from 'react';
import type { StudentProfile, PlacedDecoration, WorldDecorationItem } from '../types';
import { 
  CLIMATE_DECORATIONS, 
  getDecorationById, 
  getTileTerrain, 
  calculateWorldStats,
  WORLD2_GRID_COLS,
  WORLD2_GRID_ROWS
} from '../data/worldDecorations';
import { sound } from '../lib/audio';
import html2canvas from 'html2canvas';
import { 
  Globe2, 
  Coins, 
  Sparkles, 
  Wind, 
  Sun, 
  Flame, 
  Leaf, 
  Trash2, 
  HelpCircle, 
  ArrowLeft, 
  Camera, 
  ShieldCheck, 
  Check, 
  X,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface World2ViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onSwitchToWorld1: () => void;
  onOpenQuiz: () => void;
  onOpenCert: () => void;
}

export function World2View({
  profile,
  onUpdateProfile,
  onSwitchToWorld1,
  onOpenQuiz,
  onOpenCert,
}: World2ViewProps) {
  const decorations = useMemo(() => profile.world2Decorations || [], [profile.world2Decorations]);
  const stats = useMemo(() => calculateWorldStats(decorations), [decorations]);

  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [selectedItemToPlace, setSelectedItemToPlace] = useState<WorldDecorationItem | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [inspectingPlaced, setInspectingPlaced] = useState<PlacedDecoration | null>(null);
  const [capturing, setCapturing] = useState(false);

  const worldCanvasRef = useRef<HTMLDivElement | null>(null);

  // Map of placed decorations by "x_y"
  const placedMap = useMemo(() => {
    const map = new Map<string, PlacedDecoration>();
    for (const dec of decorations) {
      map.set(`${dec.tileX}_${dec.tileY}`, dec);
    }
    return map;
  }, [decorations]);

  // Handle tile click on the map
  const handleTileClick = (x: number, y: number) => {
    sound.playJump();
    const key = `${x}_${y}`;
    const existing = placedMap.get(key);

    if (existing) {
      setInspectingPlaced(existing);
      setSelectedTile({ x, y });
      setSelectedItemToPlace(null);
    } else {
      setInspectingPlaced(null);
      setSelectedTile({ x, y });
      // If user already has an item selected to place, attempt to place it
      if (selectedItemToPlace) {
        attemptPlaceItem(selectedItemToPlace, x, y);
      } else {
        // Open the climate decor shop
        setShowShopModal(true);
      }
    }
  };

  const attemptPlaceItem = (item: WorldDecorationItem, x: number, y: number) => {
    const terrain = getTileTerrain(x, y);

    // Terrain compatibility check
    const isCompatible = 
      item.allowedTerrain === 'coastal' 
        ? (terrain === 'coastal' || terrain === 'land')
        : item.allowedTerrain === terrain;

    if (!isCompatible) {
      sound.playHit();
      const allowedKo = 
        item.allowedTerrain === 'water' ? '깊은 바다(수역)' : 
        item.allowedTerrain === 'coastal' ? '해안선(습지)' : '육지(대지)';
      alert(`[설치 불가] '${item.name}'은(는) ${allowedKo} 지형에만 설치할 수 있습니다.`);
      return;
    }

    // Cost check
    if (profile.coins < item.price) {
      sound.playHit();
      alert(`코인이 부족합니다! (필요 코인: ${item.price}, 보유: ${profile.coins})\n기후 퀴즈를 풀고 코인을 추가 획득할 수 있습니다.`);
      return;
    }

    sound.playMilestoneBonus();

    const newPlaced: PlacedDecoration = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      tileX: x,
      tileY: y,
      placedAt: new Date().toISOString(),
    };

    const updatedProfile: StudentProfile = {
      ...profile,
      coins: profile.coins - item.price,
      world2Decorations: [...decorations, newPlaced],
      lastPlayedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
    setSelectedItemToPlace(null);
    setShowShopModal(false);
  };

  // Remove decoration
  const handleRemoveDecoration = (decId: string) => {
    const dec = decorations.find((d) => d.id === decId);
    if (!dec) return;

    const item = getDecorationById(dec.itemId);
    sound.playCoin();

    // Partial refund (50% of cost returned)
    const refund = item ? Math.floor(item.price * 0.5) : 5;

    const updatedProfile: StudentProfile = {
      ...profile,
      coins: profile.coins + refund,
      world2Decorations: decorations.filter((d) => d.id !== decId),
      lastPlayedAt: new Date().toISOString(),
    };

    onUpdateProfile(updatedProfile);
    setInspectingPlaced(null);
    setSelectedTile(null);
  };

  // Capture screenshot of the customized World 2
  const handleCaptureWorld = async () => {
    if (!worldCanvasRef.current) return;
    setCapturing(true);
    sound.playCoin();

    try {
      const canvas = await html2canvas(worldCanvasRef.current, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `제2세계_에코생태월드_${profile.manageCode}_${profile.nickname}.png`;
      link.href = dataUrl;
      link.click();
      sound.playLevelClear();
    } catch (err) {
      console.error('World capture failed:', err);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col select-none overflow-x-hidden">
      {/* Top World 2 Navigation Bar */}
      <header className="w-full bg-slate-900/95 border-b-2 border-emerald-500/50 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-to-world1"
            type="button"
            onClick={() => {
              sound.playJump();
              onSwitchToWorld1();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-pixel text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="기후위기 탈출 런 1세계로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>🏃 1세계 러닝 모험</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400">
              <Globe2 className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-pixel font-bold text-emerald-300">
                  제2세계: 기후 회복 에코 월드
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-pixel font-semibold border border-emerald-400/60">
                  {stats.grade}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                기후위기 극복 기술과 자연기반해법(NbS)으로 지구 생태계를 복원하세요
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Coin balance */}
          <button
            id="btn-world2-coins"
            type="button"
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 bg-yellow-950/60 hover:bg-yellow-900/60 border border-yellow-500/50 px-3 py-1.5 rounded-xl font-pixel text-xs text-yellow-300 cursor-pointer transition-colors shadow-sm"
            title="기후 퀴즈를 풀고 코인 얻기"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{profile.coins} 코인</span>
            <span className="text-[10px] text-amber-400 underline decoration-dotted ml-0.5">+코인 퀴즈</span>
          </button>

          {/* Shop open button */}
          <button
            id="btn-open-world-shop"
            type="button"
            onClick={() => {
              sound.playCoin();
              setShowShopModal(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-pixel text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>기후 월드 상점</span>
          </button>

          {/* Capture button */}
          <button
            id="btn-capture-world"
            type="button"
            disabled={capturing}
            onClick={handleCaptureWorld}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
            title="내 월드 인증샷 캡처 다운로드"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Real-time Ecological Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-500/30 backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">온실가스 일일 흡수량</span>
              <span className="font-bold text-emerald-300 text-xs sm:text-sm">
                +{stats.totalCo2.toLocaleString()} kg/일
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">지구 기온 냉각 기여</span>
              <span className="font-bold text-sky-300 text-xs sm:text-sm">
                -{stats.totalTempReduction.toFixed(2)} °C
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">생태 복원 포인트</span>
              <span className="font-bold text-yellow-300 text-xs sm:text-sm">
                {stats.totalEcoPoints.toLocaleString()} EP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">설치된 기후 인프라</span>
              <span className="font-bold text-teal-300 text-xs sm:text-sm">
                {stats.itemCount} / {WORLD2_GRID_ROWS * WORLD2_GRID_COLS} 구역
              </span>
            </div>
          </div>
        </div>

        {/* Selected Item Placement Notice */}
        {selectedItemToPlace && (
          <div className="bg-emerald-950/80 border-2 border-emerald-400 p-3 rounded-xl flex items-center justify-between gap-3 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedItemToPlace.icon}</span>
              <div>
                <strong className="text-emerald-300">{selectedItemToPlace.name}</strong> 설치 모드 활성화됨!
                <p className="text-[11px] text-slate-300">
                  지도의 원하는 빈 타일({selectedItemToPlace.allowedTerrain === 'water' ? '바다' : selectedItemToPlace.allowedTerrain === 'coastal' ? '해안선' : '육지'})을 클릭하세요.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItemToPlace(null)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            >
              취소
            </button>
          </div>
        )}

        {/* Interactive World Canvas & Grid Area */}
        <div 
          ref={worldCanvasRef}
          id="world2-canvas-container"
          className="relative bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 p-4 sm:p-6 rounded-3xl border-3 border-emerald-500/60 shadow-2xl overflow-hidden"
        >
          {/* Header Tag inside Capturable Container */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-pixel text-[10px] border border-emerald-400">
                CLIMATE SANCTUARY
              </span>
              <span className="text-xs font-pixel text-slate-200">
                {profile.nickname} 탐험가의 지구 회복 에코 월드
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              관리코드: {profile.manageCode} · Level {profile.level} Master
            </span>
          </div>

          {/* Terrain Guidance Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-300 mb-3 px-1">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-600/60 border border-blue-400 inline-block"></span>
              깊은 바다 (풍력·빙하냉각·잘피)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-teal-600/60 border border-teal-400 inline-block"></span>
              해안선·습지 (맹그로브·소수력)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-800/60 border border-emerald-400 inline-block"></span>
              육지·도시 (태양광·DAC·스펀지정원·스마트팜)
            </span>
          </div>

          {/* 10 x 6 Interactive Isometric/Grid Canvas */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 w-full aspect-[16/9] sm:aspect-[2/1] min-h-[340px] p-2 bg-slate-950/70 rounded-2xl border-2 border-slate-800">
            {Array.from({ length: WORLD2_GRID_ROWS }).map((_, r) => (
              Array.from({ length: WORLD2_GRID_COLS }).map((_, c) => {
                const terrain = getTileTerrain(c, r);
                const placed = placedMap.get(`${c}_${r}`);
                const item = placed ? getDecorationById(placed.itemId) : null;
                const isSelected = selectedTile?.x === c && selectedTile?.y === r;

                // Terrain styling
                let terrainBg = 'bg-blue-950/70 border-blue-800/60 hover:border-blue-400';
                if (terrain === 'coastal') {
                  terrainBg = 'bg-teal-950/70 border-teal-700/60 hover:border-teal-400';
                } else if (terrain === 'land') {
                  terrainBg = 'bg-emerald-950/70 border-emerald-800/60 hover:border-emerald-400';
                }

                if (isSelected) {
                  terrainBg += ' ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20';
                }

                return (
                  <button
                    key={`${c}_${r}`}
                    id={`world-tile-${c}-${r}`}
                    type="button"
                    onClick={() => handleTileClick(c, r)}
                    className={`relative rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 overflow-hidden group ${terrainBg}`}
                    title={placed ? `${item?.name} (클릭하여 상세 정보)` : `빈 타일 (${terrain === 'water' ? '바다' : terrain === 'coastal' ? '해안선' : '대지'})`}
                  >
                    {/* Terrain micro indicator */}
                    <span className="absolute top-1 left-1 text-[8px] opacity-40 font-mono">
                      {terrain === 'water' ? '🌊' : terrain === 'coastal' ? '🏖️' : '🌱'}
                    </span>

                    {/* Render placed climate installation */}
                    {item ? (
                      <div className="flex flex-col items-center justify-center text-center animate-fade-in z-10">
                        <span className="text-xl sm:text-2xl drop-shadow-md transform group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <span className="text-[9px] font-pixel text-white font-bold truncate max-w-full hidden sm:block px-0.5">
                          {item.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-yellow-300 font-pixel">+설치</span>
                      </div>
                    )}

                    {/* Subtle water / wave / grass animation overlay */}
                    {terrain === 'water' && (
                      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse"></div>
                    )}
                  </button>
                );
              })
            ))}
          </div>

          {/* Footer inside Capturable Card */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-emerald-500/30 text-[10px] text-slate-400">
            <span>🌿 탄소중립 실천 인증 프로젝트 · 에코 시티즌 복원 협회</span>
            <span className="text-emerald-400 font-pixel">TOTAL ECO SCORE: {stats.totalEcoPoints} EP</span>
          </div>
        </div>

        {/* Selected Installation Info Inspector Bar */}
        {inspectingPlaced && (() => {
          const item = getDecorationById(inspectingPlaced.itemId);
          if (!item) return null;

          return (
            <div className="bg-slate-900/90 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-xl">
              <div className="flex items-start sm:items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-2xl shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-bold text-white font-pixel">
                      {item.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (타일 좌표: [{inspectingPlaced.tileX}, {inspectingPlaced.tileY}])
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {item.desc}
                  </p>
                  <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>기후과학 사실: {item.scientificFact}</span>
                  </p>
                </div>
              </div>

              {/* Metrics & Reclaim / Move Button */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className="text-right pr-2 border-r border-slate-700">
                  <div className="text-[10px] text-slate-400">기후 기여 효과</div>
                  <div className="text-xs font-mono font-bold text-emerald-300">
                    +{item.co2Reduction}kg CO2 · -{item.tempReduction}°C
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDecoration(inspectingPlaced.id)}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-pixel text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  title="철거 시 코인 50%를 환급받습니다"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>철거 (50% 환급)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInspectingPlaced(null);
                    setSelectedTile(null);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Climate Education Information Banner */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold font-pixel">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>제2세계 월드 꾸미기 기후 가이드:</span>
          </div>
          <p className="leading-relaxed">
            월드 꾸미기 상점에서는 오직 <strong>온실가스 감축, 해수면 상승 방어, 청정 재생에너지, 자연기반해법(NbS)</strong> 등 기후위기 극복과 직결된 검증된 친환경 인프라만을 판매합니다. 물품을 적절한 지형에 배치하여 지구 온도와 온실가스 농도를 낮추고 에코 파라다이스를 완성해보세요!
          </p>
        </div>
      </main>

      {/* Climate Decor Shop Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border-3 border-emerald-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-pixel font-bold text-white flex items-center gap-2">
                    기후위기 극복 월드 꾸미기 상점
                    <span className="text-xs text-emerald-300 font-normal">Eco Sanctuary Store</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    기후위기 해결과 직결된 생태 복원 및 청정에너지 기술만을 엄선하여 제공합니다
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 border border-yellow-400/60 rounded-full font-pixel text-xs text-yellow-300">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{profile.coins} 코인</span>
                </div>
                <button
                  id="btn-close-world-shop"
                  onClick={() => setShowShopModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notice about earning coins */}
            <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 my-3 text-xs">
              <span className="text-slate-300">
                코인이 부족하신가요? 1세계 러닝이나 <strong>기후 퀴즈</strong>를 풀어 코인을 충전할 수 있습니다.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowShopModal(false);
                  onOpenQuiz();
                }}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/60 rounded-lg font-pixel text-xs cursor-pointer"
              >
                +퀴즈 풀러 가기
              </button>
            </div>

            {/* List of 10 Climate Crisis Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {CLIMATE_DECORATIONS.map((item) => {
                const canAfford = profile.coins >= item.price;
                const terrainKo = 
                  item.allowedTerrain === 'water' ? '바다(수역)' : 
                  item.allowedTerrain === 'coastal' ? '해안선(습지)' : '육지(대지)';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border-2 bg-slate-800/80 border-slate-700 hover:border-emerald-400/70 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      {/* Item Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl p-1.5 rounded-xl bg-slate-900 border border-slate-700">
                            {item.icon}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white font-pixel">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-pixel">
                                {item.categoryLabel}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                                {terrainKo}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 font-pixel text-xs text-yellow-300 shrink-0">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{item.price}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {item.desc}
                      </p>

                      {/* Scientific Climate Impact Fact */}
                      <div className="mt-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-emerald-400/90 leading-tight">
                        <span className="font-bold text-emerald-300">🌱 기후 효과:</span> 탄소 흡수 +{item.co2Reduction}kg/일 · 기온 저감 -{item.tempReduction}°C · 생태 포인트 +{item.ecoPoints} EP
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        설치 가능 지형: <strong className="text-white">{terrainKo}</strong>
                      </span>

                      <button
                        id={`btn-buy-decor-${item.id}`}
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          if (selectedTile) {
                            attemptPlaceItem(item, selectedTile.x, selectedTile.y);
                          } else {
                            setSelectedItemToPlace(item);
                            setShowShopModal(false);
                            sound.playCoin();
                          }
                        }}
                        className={`px-4 py-2 rounded-xl font-pixel text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{selectedTile ? '선택 타일에 설치' : '구매 후 배치'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
