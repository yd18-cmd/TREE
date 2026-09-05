import type { WorldDecorationItem } from '../types';

export const CLIMATE_DECORATIONS: WorldDecorationItem[] = [
  {
    id: 'mangrove_forest',
    name: '블루카본 맹그로브 숲',
    category: 'ocean_blue_carbon',
    categoryLabel: '해양 블루카본',
    icon: '🌿',
    price: 20,
    co2Reduction: 85,
    tempReduction: 0.03,
    ecoPoints: 150,
    desc: '해안선 침식을 방어하고 열대우림보다 최대 5배 많은 온실가스를 갯벌 퇴적층에 영구 격리합니다.',
    scientificFact: '맹그로브 숲은 해수면 상승 시 파도 에너지를 최대 66%까지 감쇠시켜 연안 공동체를 보호합니다.',
    allowedTerrain: 'coastal',
  },
  {
    id: 'offshore_wind',
    name: '해상 부유식 풍력 발전기',
    category: 'renewable_energy',
    categoryLabel: '청정 재생에너지',
    icon: '🌀',
    price: 35,
    co2Reduction: 125,
    tempReduction: 0.05,
    ecoPoints: 230,
    desc: '먼바다의 청정 해풍을 통해 화석연료 발전소를 완전히 대체하는 무탄소 청정에너지를 생산합니다.',
    scientificFact: '해상풍력 1기는 연간 약 3,000톤 이상의 이산화탄소 배출을 억제하며 바다에 인공어초 역할도 합니다.',
    allowedTerrain: 'water',
  },
  {
    id: 'bipv_solar_farm',
    name: 'BIPV 차세대 태양광 솔라팜',
    category: 'renewable_energy',
    categoryLabel: '청정 재생에너지',
    icon: '☀️',
    price: 25,
    co2Reduction: 95,
    tempReduction: 0.04,
    ecoPoints: 170,
    desc: '건물 일체형 태양광(BIPV)과 솔라패널로 100% RE100 분산형 친환경 전력을 자립 생산합니다.',
    scientificFact: '태양광 발전은 전력 생산 중 온실가스나 대기오염물질을 일절 배출하지 않는 핵심 탈탄소 기술입니다.',
    allowedTerrain: 'land',
  },
  {
    id: 'dac_carbon_capture',
    name: '대기 직접 탄소 포집탑 (DAC)',
    category: 'carbon_capture',
    categoryLabel: '이산화탄소 직접 포집',
    icon: '🧪',
    price: 50,
    co2Reduction: 210,
    tempReduction: 0.08,
    ecoPoints: 360,
    desc: '대기 중의 이산화탄소를 직접 필터링하여 안전한 탄산염 광물로 변환하여 영구 격리합니다.',
    scientificFact: 'IPCC 6차 평가보고서는 지구 온도 상승을 1.5°C 이내로 억제하기 위해 탄소 포집(DAC)이 필수적이라고 강조합니다.',
    allowedTerrain: 'land',
  },
  {
    id: 'glacier_cooling_dome',
    name: '극지 빙하 보호 냉각 돔',
    category: 'cooling_adaptation',
    categoryLabel: '기후 적응 & 냉각',
    icon: '❄️',
    price: 45,
    co2Reduction: 140,
    tempReduction: 0.07,
    ecoPoints: 290,
    desc: '태양열 반사 알베도(Albedo) 효과를 복원하고 특수 지오엔지니어링 냉각막으로 해빙 융해를 억제합니다.',
    scientificFact: '북극 해빙이 녹아 어두운 바다가 노출되면 열 흡수가 가속화되는 악순환을 냉각 돔이 차단합니다.',
    allowedTerrain: 'water',
  },
  {
    id: 'seagrass_bed',
    name: '해조류 잘피밭 서식지',
    category: 'ocean_blue_carbon',
    categoryLabel: '해양 블루카본',
    icon: '🌊',
    price: 28,
    co2Reduction: 90,
    tempReduction: 0.03,
    ecoPoints: 160,
    desc: '수중 잘피밭 군락지를 조성하여 해양 산성화를 완화하고 바닷속 온실가스를 빠르게 흡수합니다.',
    scientificFact: '잘피밭은 전 세계 바다 면적의 0.2%에 불과하지만 전체 해양 탄소 매장량의 10% 이상을 저장합니다.',
    allowedTerrain: 'water',
  },
  {
    id: 'zero_emission_hub',
    name: '친환경 전기·수소 충전 스테이션',
    category: 'eco_urban',
    categoryLabel: '친환경 저탄소 인프라',
    icon: '⚡',
    price: 30,
    co2Reduction: 85,
    tempReduction: 0.03,
    ecoPoints: 160,
    desc: '화석연료 내연기관차 배기가스를 완전히 차단하고 친환경 그린 모빌리티 인프라를 구축합니다.',
    scientificFact: '수송 부문은 전 세계 온실가스 배출의 약 15%를 차지하며 친환경차 전환 시 도심 미세먼지가 급감합니다.',
    allowedTerrain: 'land',
  },
  {
    id: 'rainwater_sponge_garden',
    name: '도시 빗물 순환 스펀지 정원',
    category: 'cooling_adaptation',
    categoryLabel: '기후 적응 & 냉각',
    icon: '🌧️',
    price: 22,
    co2Reduction: 65,
    tempReduction: 0.03,
    ecoPoints: 140,
    desc: '불투수 아스팔트 대신 빗물을 스펀지처럼 흡수·저류하여 도심 열섬 현상을 식히고 침수를 방지합니다.',
    scientificFact: '스펀지 시티 자연기반해법(NbS)은 기후위기로 인한 게릴라성 극한 폭우 피해를 70% 이상 줄여줍니다.',
    allowedTerrain: 'land',
  },
  {
    id: 'eco_micro_hydro',
    name: '소수력 친환경 터빈 & 어도',
    category: 'renewable_energy',
    categoryLabel: '청정 재생에너지',
    icon: '💧',
    price: 32,
    co2Reduction: 105,
    tempReduction: 0.04,
    ecoPoints: 195,
    desc: '대규모 댐 건설에 따른 생태계 파괴 없이 자연 하천의 흐름으로 24시간 청정에너지를 공급합니다.',
    scientificFact: '소수력 발전은 생물다양성 보존 어도와 함께 설계되어 하천 생태계를 지키며 탄소를 줄입니다.',
    allowedTerrain: 'coastal',
  },
  {
    id: 'geothermal_smart_farm',
    name: '지열 제로에너지 스마트 에코팜',
    category: 'eco_urban',
    categoryLabel: '친환경 저탄소 인프라',
    icon: '🏡',
    price: 40,
    co2Reduction: 115,
    tempReduction: 0.05,
    ecoPoints: 240,
    desc: '일정한 땅속 지열(15°C)을 냉난방에 활용하여 화석연료 배출 0%의 친환경 순환 식량 안보를 달성합니다.',
    scientificFact: '지열 히트펌프는 보일러 대비 에너지 소비를 최대 70% 감축하며 사계절 무탄소 스마트 농업을 가능케 합니다.',
    allowedTerrain: 'land',
  },
];

// Helper to look up an item by ID
export function getDecorationById(id: string): WorldDecorationItem | undefined {
  return CLIMATE_DECORATIONS.find((item) => item.id === id);
}

// 10x6 Default World 2 Terrain Grid (0 = Water, 1 = Coastal, 2 = Land)
// 0: Deep ocean (water items: wind turbine, cooling dome, seagrass)
// 1: Coastline / Beach (coastal items: mangrove, micro hydro, etc.)
// 2: Inland green plains (land items: solar farm, DAC tower, sponge garden, zero emission hub, geothermal farm)
export const WORLD2_GRID_ROWS = 6;
export const WORLD2_GRID_COLS = 10;

export function getTileTerrain(x: number, y: number): 'water' | 'coastal' | 'land' {
  // Left 3 columns: Ocean water
  if (x <= 2) return 'water';
  // Column 3 & 4: Coastline / Wetlands
  if (x <= 4) return 'coastal';
  // Columns 5 to 9: Green inland
  return 'land';
}

export function calculateWorldStats(decorations: { itemId: string }[]) {
  let totalCo2 = 0;
  let totalTempReduction = 0;
  let totalEcoPoints = 0;

  for (const dec of decorations) {
    const item = getDecorationById(dec.itemId);
    if (item) {
      totalCo2 += item.co2Reduction;
      totalTempReduction += item.tempReduction;
      totalEcoPoints += item.ecoPoints;
    }
  }

  // Determine Sanctuary Grade based on eco points
  let grade = '1단계: 회복 시작 구역';
  let badgeColor = 'text-sky-400';
  if (totalEcoPoints >= 1500) {
    grade = '5단계: 완전한 에코 파라다이스';
    badgeColor = 'text-emerald-300';
  } else if (totalEcoPoints >= 1000) {
    grade = '4단계: 탄소 네거티브 실현 지구';
    badgeColor = 'text-emerald-400';
  } else if (totalEcoPoints >= 600) {
    grade = '3단계: 넷제로 기후 회복 성지';
    badgeColor = 'text-teal-300';
  } else if (totalEcoPoints >= 250) {
    grade = '2단계: 녹색 재생 생태 구역';
    badgeColor = 'text-amber-300';
  }

  return {
    totalCo2,
    totalTempReduction: Number(totalTempReduction.toFixed(3)),
    totalEcoPoints,
    grade,
    badgeColor,
    itemCount: decorations.length,
  };
}
