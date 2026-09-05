import { useEffect, useRef, useState, useCallback } from 'react';
import type { 
  StudentProfile, 
  Obstacle, 
  CollectibleItem, 
  PlantedTree, 
  Boss, 
  PlayerProjectile,
  ObstacleType,
  ItemType
} from '../types';
import { PixelRenderer } from '../lib/pixelArt';
import { sound } from '../lib/audio';
import { HUD } from './HUD';
import { GameOverComic } from './GameOverComic';
import { MasterCertificateModal } from './MasterCertificateModal';
import { ShopModal } from './ShopModal';
import { BossIntroModal } from './BossIntroModal';
import { StoryModal } from './StoryModal';
import { QuizModal } from './QuizModal';
import { CertificationModal } from './CertificationModal';
import { World2View } from './World2View';
import { saveStudentProfile } from '../lib/firebase';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  Zap, 
  Sparkles
} from 'lucide-react';

interface GameCanvasProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onHome: () => void;
}

export function GameCanvas({ profile, onUpdateProfile, onHome }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Profile ref to always have latest state in requestAnimationFrame loop
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Game UI overlays
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBossIntro, setShowBossIntro] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(profile.level === 1 && profile.score === 0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // World 1 (Stage Runner) vs World 2 (Eco Sanctuary Decorating)
  const isWorld2Unlocked = Boolean(
    profile.isWorld2Unlocked || 
    profile.level > 50 || 
    profile.isMaster || 
    (profile.highestLevel && profile.highestLevel > 50)
  );
  const [currentWorld, setCurrentWorld] = useState<1 | 2>(() => {
    if (profile.currentWorld === 2 && isWorld2Unlocked) return 2;
    if (profile.level > 50) return 2;
    return 1;
  });

  // HUD stats state
  const [waterLevelPct, setWaterLevelPct] = useState(20);
  const [earthTemp, setEarthTemp] = useState(profile.earthTemp || 1.2);
  const [seedCount, setSeedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [bgmEnabled, setBgmEnabled] = useState(sound.bgmEnabled);
  const [levelAnnounce, setLevelAnnounce] = useState<string | null>(`LEVEL ${profile.level} START!`);

  // Touch controls active tracking
  const touchControls = useRef({
    left: false,
    right: false,
    jump: false,
    shoot: false,
  });

  // Game World State Refs (held in refs for 60FPS physics loop without re-triggering component re-renders)
  const gameState = useRef({
    player: {
      x: 80,
      y: 300,
      width: 36,
      height: 44,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facingRight: true,
      invincibleTimer: 0,
      state: 'idle' as 'idle' | 'run' | 'jump' | 'hurt',
      animFrame: 0,
      animTick: 0,
    },
    cameraX: 0,
    groundY: 380,
    stageWidth: 2800,
    waterY: 420, // Canvas coordinate where water surface starts
    baselineWaterY: 420,
    waterRiseSpeed: 0.05,
    obstacles: [] as Obstacle[],
    items: [] as CollectibleItem[],
    trees: [] as PlantedTree[],
    boss: null as Boss | null,
    playerProjectiles: [] as PlayerProjectile[],
    keys: {
      left: false,
      right: false,
      jump: false,
      shoot: false,
    },
    isBossStage: false,
    levelCleared: false,
    currentLevel: profile.level,
    stageProgress: 0,
  });

  // Check if current level is a boss stage
  const checkIsBossStage = useCallback((lvl: number) => {
    return lvl % 5 === 0;
  }, []);

  // Initialize or Reset a level stage
  const initStage = useCallback((levelToLoad: number) => {
    const isBoss = checkIsBossStage(levelToLoad);
    const canvas = canvasRef.current;
    const viewWidth = canvas ? canvas.width : 800;
    const stageWidth = isBoss ? viewWidth + 200 : 2200 + Math.min(levelToLoad * 60, 2000);
    const groundY = 380;
    const initialWater = groundY + 80 - Math.min(120, (levelToLoad - 1) * 2);

    // Obstacle types and density based on level
    const obstacles: Obstacle[] = [];
    const items: CollectibleItem[] = [];

    if (!isBoss) {
      // Procedural obstacle and item generation along stage
      const step = Math.max(160, 320 - levelToLoad * 3);
      for (let x = 350; x < stageWidth - 300; x += step + Math.random() * 80) {
        // Decide obstacle vs item
        const rand = Math.random();
        if (rand < 0.58) {
          // Spawn Obstacle
          const obsTypes: ObstacleType[] = ['car', 'carbon_cloud', 'factory_smoke', 'deforestation'];
          const chosen = obsTypes[Math.floor(Math.random() * obsTypes.length)];
          const isFlying = chosen === 'carbon_cloud';
          const obsY = isFlying ? groundY - 70 - Math.random() * 50 : groundY - 32;

          obstacles.push({
            id: `obs_${x}`,
            x,
            y: obsY,
            width: chosen === 'car' ? 44 : chosen === 'carbon_cloud' ? 48 : 40,
            height: chosen === 'car' ? 32 : chosen === 'carbon_cloud' ? 36 : 40,
            vx: chosen === 'car' ? -(1.2 + levelToLoad * 0.06) : 0,
            type: chosen,
            name: chosen === 'car' ? '내연기관 자동차' : chosen === 'carbon_cloud' ? '온실가스 매연' : '탄소배출 공장',
            tempImpact: 0.05,
            waterImpact: 22,
          });
        } else {
          // Spawn Collectible Item
          const itemTypes: ItemType[] = ['seed', 'seed', 'solar', 'wind', 'coin'];
          const chosen = itemTypes[Math.floor(Math.random() * itemTypes.length)];
          const isAir = chosen === 'solar' || chosen === 'wind';
          const itemY = isAir ? groundY - 60 - Math.random() * 40 : groundY - 30;

          items.push({
            id: `item_${x}`,
            x,
            y: itemY,
            width: 28,
            height: 28,
            type: chosen,
            name: chosen === 'seed' ? '생명의 씨앗' : chosen === 'solar' ? '태양광 발전기' : '친환경 코인',
            waterReduction: chosen === 'seed' ? 35 : 20,
            tempReduction: chosen === 'seed' ? 0.06 : 0.03,
            coinValue: chosen === 'coin' ? 2 : 1,
          });
        }
      }
    }

    // Set up Boss if boss stage
    let bossObj: Boss | null = null;
    if (isBoss) {
      // Significantly increased boss HP for a more epic, challenging battle
      const bossHp = levelToLoad >= 50 ? 5000 : (400 + levelToLoad * 70);
      bossObj = {
        x: stageWidth - 280,
        y: groundY - 140,
        width: 120,
        height: 140,
        maxHp: bossHp,
        hp: bossHp,
        name: '지구열화 빙하거인',
        attackTimer: 0,
        phase: 1,
        projectiles: [],
      };

      // Also spawn helpful seeds in boss stage arena
      for (let bx = 200; bx < stageWidth - 350; bx += 180) {
        items.push({
          id: `boss_item_${bx}`,
          x: bx,
          y: groundY - 30,
          width: 28,
          height: 28,
          type: 'seed',
          name: '생명의 씨앗',
          waterReduction: 30,
          tempReduction: 0.05,
          coinValue: 2,
        });
      }
    }

    gameState.current = {
      player: {
        x: 80,
        y: groundY - 50,
        width: 36,
        height: 44,
        vx: 0,
        vy: 0,
        isGrounded: false,
        facingRight: true,
        invincibleTimer: 0,
        state: 'idle',
        animFrame: 0,
        animTick: 0,
      },
      cameraX: 0,
      groundY,
      stageWidth,
      waterY: initialWater,
      baselineWaterY: initialWater,
      waterRiseSpeed: 0.03 + Math.min(0.08, levelToLoad * 0.002),
      obstacles,
      items,
      trees: [],
      boss: bossObj,
      playerProjectiles: [],
      keys: { left: false, right: false, jump: false, shoot: false },
      isBossStage: isBoss,
      levelCleared: false,
      currentLevel: levelToLoad,
      stageProgress: 0,
    };

    setIsGameOver(false);
    setIsPaused(false);
    setWaterLevelPct(20);
    setLevelAnnounce(isBoss ? `🚨 BOSS: 지구열화 빙하거인 출현! 🚨` : `STAGE ${levelToLoad}`);

    if (isBoss) {
      setShowBossIntro(true);
    }

    setTimeout(() => {
      setLevelAnnounce(null);
    }, 2500);
  }, [checkIsBossStage]);

  // Initialize stage when level changes or component mounts
  useEffect(() => {
    initStage(profile.level);
  }, [profile.level, initStage]);

  // Sync profile changes to Firestore and state
  const syncProfile = useCallback((updates: Partial<StudentProfile>) => {
    const updated: StudentProfile = {
      ...profileRef.current,
      ...updates,
      lastPlayedAt: new Date().toISOString(),
    };
    profileRef.current = updated;
    onUpdateProfile(updated);
    saveStudentProfile(updated);
  }, [onUpdateProfile]);

  // Fire a player projectile (Solar cannon or seed shot)
  const handlePlayerShoot = useCallback(() => {
    const p = gameState.current.player;
    const unlocked = profileRef.current.unlockedSkills || [];
    const hasSolar = unlocked.includes('solar_weapon') || profileRef.current.isMaster;
    const hasCryo = unlocked.includes('cryo_freeze');

    if (!hasSolar && !hasCryo && seedCount <= 0) return;

    sound.playShoot();

    // Consume seed if shooting seed, or free if solar weapon
    if (!hasSolar && !hasCryo && seedCount > 0) {
      setSeedCount(s => Math.max(0, s - 1));
    }

    gameState.current.playerProjectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      x: p.facingRight ? p.x + p.width : p.x - 10,
      y: p.y + p.height * 0.4,
      vx: p.facingRight ? 9 : -9,
      vy: 0,
      radius: 8,
      damage: hasCryo ? 40 : hasSolar ? 30 : 20,
      type: 'solar',
    });
  }, [seedCount]);

  // Key Down & Up Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = gameState.current.keys;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        k.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        k.right = true;
      }
      if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
        k.jump = true;
      }
      if (e.code === 'KeyF' || e.code === 'Enter') {
        k.shoot = true;
        handlePlayerShoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = gameState.current.keys;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') k.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') k.right = false;
      if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') k.jump = false;
      if (e.code === 'KeyF' || e.code === 'Enter') k.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePlayerShoot]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      const state = gameState.current;
      const { player, groundY, stageWidth } = state;
      const unlocked = profileRef.current.unlockedSkills || [];
      const hasWindBoots = unlocked.includes('wind_boots');
      const hasAeroShield = unlocked.includes('aero_shield');
      const hasHyperSeed = unlocked.includes('hyper_seed');

      // Skip updates if paused or game over
      if (!isPaused && !isGameOver && !state.levelCleared) {
        // 1. Controls input parsing
        const moveLeft = state.keys.left || touchControls.current.left;
        const moveRight = state.keys.right || touchControls.current.right;
        const wantJump = state.keys.jump || touchControls.current.jump;

        const maxSpeed = hasWindBoots ? 5.5 : 4.5;
        const accel = 0.55;
        const friction = 0.82;

        if (moveLeft) {
          player.vx = Math.max(player.vx - accel, -maxSpeed);
          player.facingRight = false;
        } else if (moveRight) {
          player.vx = Math.min(player.vx + accel, maxSpeed);
          player.facingRight = true;
        } else {
          player.vx *= friction;
          if (Math.abs(player.vx) < 0.1) player.vx = 0;
        }

        // Jump logic
        if (wantJump && player.isGrounded) {
          player.vy = hasWindBoots ? -12.5 : -11.5;
          player.isGrounded = false;
          sound.playJump();
        }

        // Apply Gravity
        player.vy += 0.55; // gravity
        player.x += player.vx;
        player.y += player.vy;

        // Ground collision
        if (player.y + player.height >= groundY) {
          player.y = groundY - player.height;
          player.vy = 0;
          player.isGrounded = true;
        }

        // Boundaries
        if (player.x < 10) player.x = 10;
        if (player.x > stageWidth - player.width - 20) {
          player.x = stageWidth - player.width - 20;
        }

        // Update animation state
        if (!player.isGrounded) {
          player.state = 'jump';
        } else if (Math.abs(player.vx) > 0.4) {
          player.state = 'run';
          player.animTick++;
          if (player.animTick % 6 === 0) {
            player.animFrame++;
          }
        } else {
          player.state = 'idle';
        }

        if (player.invincibleTimer > 0) {
          player.invincibleTimer--;
        }

        // 2. Camera tracking
        const canvasW = canvas.width;
        state.cameraX = Math.max(0, Math.min(player.x - canvasW * 0.35, stageWidth - canvasW));

        // 3. Water rising naturally & calculation
        state.waterY -= state.waterRiseSpeed;

        // Water level percentage for gauge (0% safe, 100% full submerged)
        const totalWaterRange = groundY - (groundY - 120);
        const currentWaterDepth = groundY + 40 - state.waterY;
        const currentWaterPct = Math.min(100, Math.max(0, (currentWaterDepth / totalWaterRange) * 100));
        setWaterLevelPct(currentWaterPct);

        // 4. Critical Game Over Condition: Water reaches/covers player's full body!
        // When water surface rises above player's head: waterY <= player.y
        if (state.waterY <= player.y + 8) {
          sound.playGameOver();
          setIsGameOver(true);
          return;
        }

        // 5. Update Obstacles
        state.obstacles.forEach((obs) => {
          if (obs.vx) {
            obs.x += obs.vx;
            // Loop car back if it goes offscreen
            if (obs.x < state.cameraX - 100) {
              obs.x = state.cameraX + canvasW + 100 + Math.random() * 200;
            }
          }

          // Collision detection with player
          if (
            player.invincibleTimer <= 0 &&
            player.x < obs.x + obs.width - 6 &&
            player.x + player.width > obs.x + 6 &&
            player.y < obs.y + obs.height - 6 &&
            player.y + player.height > obs.y + 6
          ) {
            if (hasAeroShield) {
              // Shield absorbs the blow!
              sound.playHit();
              player.invincibleTimer = 90;
              // Remove shield from active profile
              const filtered = (profileRef.current.unlockedSkills || []).filter(s => s !== 'aero_shield');
              syncProfile({ unlockedSkills: filtered });
            } else {
              // Hit obstacle: water rises, earth temp increases!
              sound.playHit();
              sound.playWaterRising();
              player.invincibleTimer = 80;
              player.vx = player.facingRight ? -4 : 4;
              player.vy = -5;

              // Raise water and earth temperature
              state.waterY -= obs.waterImpact;
              const newTemp = Math.min(3.0, (profileRef.current.earthTemp || 1.2) + obs.tempImpact);
              setEarthTemp(newTemp);
              syncProfile({ earthTemp: newTemp });
            }
          }
        });

        // 6. Update Items (Collectibles)
        state.items.forEach((item) => {
          if (item.collected) return;

          if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
          ) {
            item.collected = true;

            if (item.type === 'seed') {
              // Plant tree on the ground!
              sound.playSeedPlant();
              const reduction = hasHyperSeed ? item.waterReduction * 2 : item.waterReduction;
              state.waterY = Math.min(state.baselineWaterY, state.waterY + reduction);

              const cooledTemp = Math.max(1.1, (profileRef.current.earthTemp || 1.2) - (hasHyperSeed ? item.tempReduction * 2 : item.tempReduction));
              setEarthTemp(cooledTemp);
              setSeedCount((c) => c + 1);

              state.trees.push({
                id: `tree_${Date.now()}`,
                x: item.x,
                y: groundY,
                growth: 0.1,
              });

              syncProfile({
                earthTemp: cooledTemp,
                score: profileRef.current.score + 100,
                coins: profileRef.current.coins + item.coinValue,
              });
            } else if (item.type === 'solar' || item.type === 'wind') {
              sound.playCoin();
              state.waterY = Math.min(state.baselineWaterY, state.waterY + item.waterReduction);
              const cooled = Math.max(1.1, (profileRef.current.earthTemp || 1.2) - item.tempReduction);
              setEarthTemp(cooled);
              syncProfile({
                earthTemp: cooled,
                score: profileRef.current.score + 150,
                coins: profileRef.current.coins + item.coinValue,
              });
            } else if (item.type === 'coin') {
              sound.playCoin();
              syncProfile({
                score: profileRef.current.score + 50,
                coins: profileRef.current.coins + item.coinValue,
              });
            }
          }
        });

        // 7. Grow Trees
        state.trees.forEach((t) => {
          if (t.growth < 1) {
            t.growth = Math.min(1, t.growth + 0.05);
          }
        });

        // 8. Update Player Projectiles
        for (let i = state.playerProjectiles.length - 1; i >= 0; i--) {
          const proj = state.playerProjectiles[i];
          proj.x += proj.vx;

          // Check hit against obstacles (destroy car / clear cloud)
          let destroyed = false;
          for (let j = state.obstacles.length - 1; j >= 0; j--) {
            const obs = state.obstacles[j];
            if (
              proj.x > obs.x &&
              proj.x < obs.x + obs.width &&
              proj.y > obs.y &&
              proj.y < obs.y + obs.height
            ) {
              sound.playBossHit();
              state.obstacles.splice(j, 1);
              destroyed = true;
              syncProfile({ score: profileRef.current.score + 50 });
              break;
            }
          }

          // Check hit against Boss
          if (!destroyed && state.boss) {
            const b = state.boss;
            if (
              proj.x > b.x &&
              proj.x < b.x + b.width &&
              proj.y > b.y &&
              proj.y < b.y + b.height
            ) {
              sound.playBossHit();
              b.hp -= proj.damage;
              destroyed = true;
              if (b.hp <= 0) {
                // Boss Defeated!
                sound.playLevelClear();
                state.levelCleared = true;
                state.waterY = state.baselineWaterY;
                handleLevelComplete();
              }
            }
          }

          if (
            destroyed ||
            proj.x < state.cameraX - 50 ||
            proj.x > state.cameraX + canvasW + 50
          ) {
            state.playerProjectiles.splice(i, 1);
          }
        }

        // 9. Update Boss Behavior (if boss stage)
        if (state.boss) {
          const b = state.boss;
          b.attackTimer++;

          // Boss shoots greenhouse heat balls
          if (b.attackTimer % 90 === 0) {
            b.projectiles.push({
              id: `bproj_${Date.now()}`,
              x: b.x,
              y: b.y + b.height * 0.4,
              vx: -3.8,
              vy: Math.sin(b.attackTimer) * 1.5,
              radius: 12,
            });
          }

          // Update Boss Projectiles
          for (let i = b.projectiles.length - 1; i >= 0; i--) {
            const bp = b.projectiles[i];
            bp.x += bp.vx;
            bp.y += bp.vy;

            // Player collision
            if (
              player.invincibleTimer <= 0 &&
              Math.hypot(bp.x - (player.x + player.width / 2), bp.y - (player.y + player.height / 2)) < bp.radius + 16
            ) {
              sound.playHit();
              player.invincibleTimer = 80;
              state.waterY -= 25;
              b.projectiles.splice(i, 1);
              continue;
            }

            if (bp.x < state.cameraX - 50) {
              b.projectiles.splice(i, 1);
            }
          }

          // Player jumping on boss head
          if (
            player.vy > 0 &&
            player.x + player.width > b.x &&
            player.x < b.x + b.width &&
            player.y + player.height >= b.y &&
            player.y + player.height <= b.y + 35
          ) {
            sound.playBossHit();
            player.vy = -10;
            b.hp -= 35;
            if (b.hp <= 0) {
              sound.playLevelClear();
              state.levelCleared = true;
              state.waterY = state.baselineWaterY;
              handleLevelComplete();
            }
          }
        }

        // 10. Check Goal Station Arrival (Non-boss stage completion)
        if (!state.isBossStage && player.x >= stageWidth - 120) {
          sound.playLevelClear();
          state.levelCleared = true;
          handleLevelComplete();
        }
      }

      // --- RENDERING PHASE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky gradient (shifts with Earth temperature)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      if (earthTemp >= 2.0) {
        skyGrad.addColorStop(0, '#451a03');
        skyGrad.addColorStop(1, '#7c2d12');
      } else if (earthTemp >= 1.5) {
        skyGrad.addColorStop(0, '#1e293b');
        skyGrad.addColorStop(1, '#0f766e');
      } else {
        skyGrad.addColorStop(0, '#0c4a6e');
        skyGrad.addColorStop(1, '#0284c7');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 6; i++) {
        const cloudX = ((i * 240 - state.cameraX * 0.2) % (canvas.width + 200)) - 50;
        ctx.beginPath();
        ctx.arc(cloudX, 70 + (i % 3) * 20, 24, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, 65 + (i % 3) * 20, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, 70 + (i % 3) * 20, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Polar Icebergs & Islands (Parallax)
      ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
      for (let i = 0; i < 4; i++) {
        const iceX = (i * 450 - state.cameraX * 0.3) % (canvas.width + 400);
        ctx.beginPath();
        ctx.moveTo(iceX, groundY);
        ctx.lineTo(iceX + 60, groundY - 70);
        ctx.lineTo(iceX + 130, groundY);
        ctx.fill();
      }

      // Ground Platform (Sandy shore / Coastal pathway)
      ctx.save();
      ctx.translate(-state.cameraX, 0);

      // Ground Texture
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, stageWidth, canvas.height - groundY);
      // Grass/Eco verge on top
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, groundY, stageWidth, 8);
      ctx.fillStyle = '#22c55e';
      for (let gx = 0; gx < stageWidth; gx += 16) {
        ctx.fillRect(gx, groundY - 2, 8, 4);
      }

      // Goal Station
      if (!state.isBossStage) {
        PixelRenderer.drawGoalStation(ctx, stageWidth - 140, groundY - 60, 60);
      }

      // Draw Planted Trees
      state.trees.forEach((t) => {
        PixelRenderer.drawPlantedTree(ctx, t.x, t.y, t.growth);
      });

      // Draw Items
      state.items.forEach((item) => {
        if (!item.collected) {
          PixelRenderer.drawItem(ctx, item.x, item.y, item.width, item.height, item.type);
        }
      });

      // Draw Obstacles
      state.obstacles.forEach((obs) => {
        PixelRenderer.drawObstacle(ctx, obs.x, obs.y, obs.width, obs.height, obs.type);
      });

      // Draw Boss (if active)
      if (state.boss) {
        const b = state.boss;
        PixelRenderer.drawBoss(ctx, b.x, b.y, b.width, b.height, b.hp, b.maxHp, b.phase);

        // Draw Boss Projectiles
        b.projectiles.forEach((bp) => {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, bp.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw Player Projectiles
      state.playerProjectiles.forEach((proj) => {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player
      PixelRenderer.drawCharacter(
        ctx,
        player.x,
        player.y,
        player.width,
        player.height,
        profileRef.current.gender || 'male',
        player.state,
        player.facingRight,
        player.animFrame,
        player.invincibleTimer > 0
      );

      ctx.restore();

      // Draw Dynamic Rising Sea Water on top (covering foreground and character)
      const waterDanger = Math.max(0, Math.min(1, (groundY - state.waterY) / 100));
      PixelRenderer.drawSeaWater(ctx, canvas.width, canvas.height, state.waterY, waterDanger);

      // Animation loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [earthTemp, isGameOver, isPaused, syncProfile]);

  // Handle stage completion
  const handleLevelComplete = () => {
    const nextLevel = profileRef.current.level + 1;
    const isMasterUnlock = nextLevel > 50 && !profileRef.current.isMaster;
    const isWorld2Unlock = nextLevel > 50;
    
    // Level 10 multiple milestone bonus (Lv 10, 20, 30, 40, 50)
    const isTensMilestone = nextLevel % 10 === 0;
    const milestoneBonus = isTensMilestone ? (nextLevel / 10) * 15 + 10 : 0; // Lv 10: +25, Lv 20: +40, Lv 30: +55, Lv 40: +70, Lv 50: +85
    const addedCoins = 5 + milestoneBonus;

    const updatedProfile: StudentProfile = {
      ...profileRef.current,
      level: nextLevel,
      score: profileRef.current.score + 500 + (isTensMilestone ? 1000 : 0),
      coins: profileRef.current.coins + addedCoins,
      highestLevel: Math.max(profileRef.current.highestLevel || 1, nextLevel),
      isMaster: (isMasterUnlock || nextLevel > 50) ? true : profileRef.current.isMaster,
      isWorld2Unlocked: (isWorld2Unlock || profileRef.current.isWorld2Unlocked) ? true : false,
      lastPlayedAt: new Date().toISOString(),
    };

    syncProfile(updatedProfile);

    if (isTensMilestone) {
      sound.playMilestoneBonus();
    }

    if (isMasterUnlock || nextLevel === 51) {
      setShowMasterModal(true);
    } else {
      if (isTensMilestone) {
        setLevelAnnounce(`🌟 Lv.${nextLevel} 마일스톤 돌파! 보너스 +${milestoneBonus} 코인 지급!`);
      } else {
        setLevelAnnounce(`🎉 LEVEL ${profileRef.current.level} CLEAR! (+5 코인)`);
      }
      setTimeout(() => {
        initStage(nextLevel);
      }, isTensMilestone ? 2400 : 1800);
    }
  };

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = Math.floor(rect.width);
        canvasRef.current.height = Math.min(480, Math.floor(rect.height || 420));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasWeapons = (profile.unlockedSkills || []).some(s => s === 'solar_weapon' || s === 'cryo_freeze');

  // If student is in World 2 (Eco Sanctuary Decorating)
  if (currentWorld === 2) {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center select-none relative">
        <World2View
          profile={profile}
          onUpdateProfile={(updated) => syncProfile(updated)}
          onSwitchToWorld1={() => setCurrentWorld(1)}
          onOpenQuiz={() => setShowQuizModal(true)}
          onOpenCert={() => setShowCertModal(true)}
        />

        {/* Climate Quiz Modal */}
        {showQuizModal && (
          <QuizModal
            profile={profile}
            onUpdateProfile={(updated) => syncProfile(updated)}
            onClose={() => setShowQuizModal(false)}
          />
        )}

        {/* Certification Modal */}
        {showCertModal && (
          <CertificationModal
            profile={profile}
            onClose={() => setShowCertModal(false)}
          />
        )}

        {/* Weapon & Skill Shop Modal */}
        {showShopModal && (
          <ShopModal
            profile={profile}
            onUpdateProfile={(updated) => syncProfile(updated)}
            onClose={() => setShowShopModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center select-none relative overflow-hidden">
      {/* Top HUD Bar */}
      <HUD
        profile={profile}
        waterLevelPct={waterLevelPct}
        earthTemp={earthTemp}
        seedCount={seedCount}
        soundEnabled={soundEnabled}
        bgmEnabled={bgmEnabled}
        isPaused={isPaused}
        onToggleSound={() => {
          sound.enabled = !sound.enabled;
          setSoundEnabled(sound.enabled);
        }}
        onToggleBgm={() => {
          const newState = sound.toggleBgm();
          setBgmEnabled(newState);
        }}
        onTogglePause={() => setIsPaused(p => !p)}
        onOpenShop={() => setShowShopModal(true)}
        onOpenQuiz={() => setShowQuizModal(true)}
        onOpenStory={() => setShowStoryModal(true)}
        onOpenCert={() => setShowCertModal(true)}
        onOpenWorld2={isWorld2Unlocked ? () => setCurrentWorld(2) : undefined}
        canShoot={hasWeapons || seedCount > 0}
      />

      {/* Main Game Stage Container */}
      <div 
        ref={containerRef} 
        className="w-full flex-1 max-w-5xl flex items-center justify-center p-2 sm:p-4 relative"
      >
        <div className="relative w-full rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={850}
            height={420}
            className="w-full h-auto block pixel-art"
          />

          {/* Level Announce Banner */}
          {levelAnnounce && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
              <div className="px-6 py-3 bg-emerald-600/90 border-2 border-emerald-300 text-white font-pixel text-base sm:text-xl font-bold rounded-xl shadow-2xl animate-bounce tracking-wide">
                {levelAnnounce}
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-30">
              <h3 className="text-xl sm:text-2xl font-pixel text-yellow-300 mb-4">
                ⏸️ 일시 정지
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  게임 재개
                </button>
                <button
                  onClick={onHome}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded-xl cursor-pointer"
                >
                  메인으로
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet On-Screen Touch Controls */}
      <div className="w-full max-w-5xl px-4 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between z-20">
        {/* Left & Right D-pad */}
        <div className="flex items-center gap-2">
          <button
            id="touch-btn-left"
            onTouchStart={() => { touchControls.current.left = true; }}
            onTouchEnd={() => { touchControls.current.left = false; }}
            onMouseDown={() => { touchControls.current.left = true; }}
            onMouseUp={() => { touchControls.current.left = false; }}
            onMouseLeave={() => { touchControls.current.left = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-800 active:bg-emerald-600 border-2 border-slate-700 flex items-center justify-center text-white shadow-md select-none touch-manipulation cursor-pointer"
            aria-label="왼쪽 이동"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            id="touch-btn-right"
            onTouchStart={() => { touchControls.current.right = true; }}
            onTouchEnd={() => { touchControls.current.right = false; }}
            onMouseDown={() => { touchControls.current.right = true; }}
            onMouseUp={() => { touchControls.current.right = false; }}
            onMouseLeave={() => { touchControls.current.right = false; }}
            className="w-13 h-13 rounded-2xl bg-slate-800 active:bg-emerald-600 border-2 border-slate-700 flex items-center justify-center text-white shadow-md select-none touch-manipulation cursor-pointer"
            aria-label="오른쪽 이동"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Action / Jump / Weapon Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Attack / Solar Cannon Button */}
          <button
            id="touch-btn-shoot"
            onClick={handlePlayerShoot}
            className={`w-13 h-13 rounded-2xl border-2 flex flex-col items-center justify-center text-xs font-pixel shadow-md select-none touch-manipulation cursor-pointer transition-transform active:scale-90 ${
              hasWeapons || seedCount > 0
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-500 opacity-60'
            }`}
            title="원거리 정화 공격 [F]"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[9px] mt-0.5">공격</span>
          </button>

          {/* Jump Button */}
          <button
            id="touch-btn-jump"
            onTouchStart={() => { touchControls.current.jump = true; }}
            onTouchEnd={() => { touchControls.current.jump = false; }}
            onMouseDown={() => { touchControls.current.jump = true; }}
            onMouseUp={() => { touchControls.current.jump = false; }}
            onMouseLeave={() => { touchControls.current.jump = false; }}
            className="w-14 h-14 rounded-2xl bg-emerald-600 active:bg-emerald-500 border-2 border-emerald-400 flex flex-col items-center justify-center text-white shadow-lg select-none touch-manipulation cursor-pointer transition-transform active:scale-95"
            aria-label="점프"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[9px] font-pixel">점프</span>
          </button>
        </div>
      </div>

      {/* Game Over Comic Modal */}
      {isGameOver && (
        <GameOverComic
          level={profile.level}
          earthTemp={earthTemp}
          score={profile.score}
          onRetry={() => {
            initStage(profile.level);
          }}
          onHome={onHome}
        />
      )}

      {/* Master Level 50 Certificate Modal */}
      {showMasterModal && (
        <MasterCertificateModal
          nickname={profile.nickname}
          manageCode={profile.manageCode}
          score={profile.score}
          earthTemp={earthTemp}
          onOpenShop={() => {
            setShowMasterModal(false);
            setShowShopModal(true);
          }}
          onContinueGame={() => {
            setShowMasterModal(false);
            initStage(profile.level);
          }}
          onOpenCert={() => {
            setShowMasterModal(false);
            setShowCertModal(true);
          }}
          onOpenWorld2={() => {
            setShowMasterModal(false);
            setCurrentWorld(2);
          }}
        />
      )}

      {/* Weapon & Skill Shop Modal */}
      {showShopModal && (
        <ShopModal
          profile={profile}
          onUpdateProfile={(updated) => {
            syncProfile(updated);
          }}
          onClose={() => setShowShopModal(false)}
        />
      )}

      {/* Climate Quiz Center Modal */}
      {showQuizModal && (
        <QuizModal
          profile={profile}
          onUpdateProfile={(updated) => {
            syncProfile(updated);
          }}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {/* Climate Storytelling Modal */}
      {showStoryModal && (
        <StoryModal
          onClose={() => setShowStoryModal(false)}
        />
      )}

      {/* Action Certification & Capture Modal */}
      {showCertModal && (
        <CertificationModal
          profile={profile}
          onClose={() => setShowCertModal(false)}
        />
      )}

      {/* Boss Intro Encounter Modal */}
      {showBossIntro && (
        <BossIntroModal
          level={profile.level}
          onStartBattle={() => setShowBossIntro(false)}
        />
      )}
    </div>
  );
}
