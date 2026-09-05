export type CharacterGender = 'male' | 'female';

export interface StudentProfile {
  manageCode: string;
  nickname: string;
  gender: CharacterGender;
  level: number;
  score: number;
  earthTemp: number; // Base 1.2 (°C anomaly)
  coins: number;
  lastPlayedAt: string;
  unlockedSkills: string[];
  highestLevel: number;
  isMaster: boolean;
  solvedQuizIds?: string[];
  isWorld2Unlocked?: boolean;
  currentWorld?: 1 | 2;
  world2Decorations?: PlacedDecoration[];
}

export type TerrainType = 'land' | 'water' | 'coastal';

export interface WorldDecorationItem {
  id: string;
  name: string;
  category: 'ocean_blue_carbon' | 'renewable_energy' | 'carbon_capture' | 'cooling_adaptation' | 'eco_urban';
  categoryLabel: string;
  icon: string;
  price: number;
  co2Reduction: number; // kg/day
  tempReduction: number; // °C cooling impact
  ecoPoints: number; // Ecological point contribution
  desc: string;
  scientificFact: string;
  allowedTerrain: TerrainType;
}

export interface PlacedDecoration {
  id: string; // instance unique id
  itemId: string; // WorldDecorationItem id
  tileX: number; // 0..9 grid x
  tileY: number; // 0..5 grid y
  placedAt: string;
}

export type StoryVersion = 'climate_crisis' | 'global_boiling';

export interface QuizQuestion {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  tierName: string;
  coinReward: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ClimateCertification {
  id: string;
  manageCode: string;
  nickname: string;
  level: number;
  isMaster: boolean;
  pledge: string;
  actionCategory: 'energy' | 'transport' | 'recycling' | 'nature' | 'advocacy';
  createdAt: string;
  likes: number;
}

export type ObstacleType = 'car' | 'carbon_cloud' | 'factory_smoke' | 'deforestation';
export type ItemType = 'seed' | 'solar' | 'wind' | 'coin' | 'barrier';

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  vy?: number;
  collected?: boolean;
}

export interface Obstacle extends GameObject {
  type: ObstacleType;
  name: string;
  tempImpact: number;
  waterImpact: number;
}

export interface CollectibleItem extends GameObject {
  type: ItemType;
  name: string;
  waterReduction: number;
  tempReduction: number;
  coinValue: number;
}

export interface PlantedTree {
  id: string;
  x: number;
  y: number;
  growth: number; // 0 to 1
}

export interface Boss {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHp: number;
  hp: number;
  name: string;
  attackTimer: number;
  phase: number;
  projectiles: BossProjectile[];
}

export interface BossProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface PlayerProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: 'solar' | 'seed_shot';
}

export interface ShopSkill {
  id: string;
  name: string;
  icon: string;
  desc: string;
  price: number;
  category: 'weapon' | 'passive' | 'active';
}
