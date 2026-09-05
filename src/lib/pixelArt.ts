import type { CharacterGender } from '../types';

export class PixelRenderer {
  /**
   * Draws a pixelated character (Boy / Girl)
   */
  static drawCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    gender: CharacterGender,
    state: 'idle' | 'run' | 'jump' | 'hurt',
    facingRight: boolean,
    animFrame: number,
    invincible: boolean = false
  ) {
    ctx.save();
    if (invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.translate(x + width / 2, y + height / 2);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    const p = width / 16; // 16x20 pixel grid

    // Palette
    const skinColor = '#ffcca3';
    const shoeColor = '#4a2c16';
    const isBoy = gender === 'male';

    const capColor = isBoy ? '#ef4444' : '#10b981';
    const clothesColor = isBoy ? '#3b82f6' : '#06b6d4';
    const shirtColor = isBoy ? '#f97316' : '#ec4899';
    const hairColor = isBoy ? '#451a03' : '#854d0e';

    ctx.translate(-width / 2, -height / 2);

    // Helper for pixel rects
    const px = (gridX: number, gridY: number, w: number = 1, h: number = 1, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(gridX * p), Math.round(gridY * p), Math.round(w * p), Math.round(h * p));
    };

    // 1. Hat / Hair
    px(4, 1, 8, 3, capColor);
    px(3, 3, 10, 2, capColor);
    // Visor/Cap brim
    px(8, 3, 6, 2, capColor);

    // Eco badge on hat
    px(6, 2, 2, 2, '#22c55e');

    // Hair
    if (isBoy) {
      px(3, 4, 3, 2, hairColor);
      px(4, 5, 2, 1, hairColor);
    } else {
      // Ponytail
      px(1, 3, 3, 4, hairColor);
      px(0, 5, 2, 3, hairColor);
      px(3, 4, 3, 2, hairColor);
    }

    // 2. Face
    px(5, 5, 7, 4, skinColor);
    // Eyes
    px(9, 6, 2, 2, '#1e293b');
    px(10, 6, 1, 1, '#ffffff'); // Eye glint
    // Cheeks
    px(8, 8, 2, 1, '#f87171');

    // 3. Body / Clothes
    // Shirt
    px(4, 9, 8, 4, shirtColor);

    // Dungarees / Vest
    px(5, 10, 6, 5, clothesColor);
    px(5, 9, 2, 2, clothesColor); // suspenders
    px(9, 9, 2, 2, clothesColor);
    // Buttons
    px(5, 11, 1, 1, '#facc15');
    px(10, 11, 1, 1, '#facc15');

    // Hands
    if (state === 'jump') {
      // Hand raised
      px(10, 6, 3, 3, skinColor);
      px(3, 11, 3, 3, skinColor);
    } else if (state === 'run') {
      const armSwing = animFrame % 2 === 0;
      px(armSwing ? 11 : 9, 10, 3, 3, skinColor);
      px(armSwing ? 3 : 5, 10, 3, 3, skinColor);
    } else {
      px(3, 10, 2, 3, skinColor);
      px(11, 10, 2, 3, skinColor);
    }

    // 4. Legs and Shoes
    if (state === 'jump') {
      // Bent legs
      px(4, 15, 3, 2, clothesColor);
      px(9, 15, 3, 2, clothesColor);
      px(3, 17, 4, 2, shoeColor);
      px(9, 17, 4, 2, shoeColor);
    } else if (state === 'run') {
      const step = animFrame % 4;
      if (step === 0 || step === 2) {
        px(5, 15, 3, 3, clothesColor);
        px(8, 15, 3, 3, clothesColor);
        px(4, 18, 4, 2, shoeColor);
        px(8, 18, 4, 2, shoeColor);
      } else if (step === 1) {
        px(3, 15, 3, 3, clothesColor);
        px(10, 15, 3, 2, clothesColor);
        px(2, 18, 4, 2, shoeColor);
        px(10, 17, 4, 2, shoeColor);
      } else {
        px(7, 15, 3, 2, clothesColor);
        px(9, 15, 3, 3, clothesColor);
        px(7, 17, 4, 2, shoeColor);
        px(10, 18, 4, 2, shoeColor);
      }
    } else {
      // Idle standing
      px(5, 15, 3, 3, clothesColor);
      px(8, 15, 3, 3, clothesColor);
      px(4, 18, 4, 2, shoeColor);
      px(8, 18, 4, 2, shoeColor);
    }

    ctx.restore();
  }

  /**
   * Draw obstacle: Car, Carbon Cloud, Factory Smoke, Deforestation
   */
  static drawObstacle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ) {
    ctx.save();
    const p = width / 16;
    const px = (gx: number, gy: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x + gx * p), Math.round(y + gy * p), Math.round(w * p), Math.round(h * p));
    };

    if (type === 'car') {
      // Pixel Gasoline Car
      px(2, 6, 12, 5, '#ef4444');
      px(5, 2, 7, 4, '#dc2626');
      // Windows
      px(6, 3, 2, 3, '#93c5fd');
      px(9, 3, 2, 3, '#93c5fd');
      // Wheels
      px(3, 10, 3, 3, '#1f2937');
      px(10, 10, 3, 3, '#1f2937');
      px(4, 11, 1, 1, '#9ca3af');
      px(11, 11, 1, 1, '#9ca3af');
      // Headlight
      px(13, 7, 2, 2, '#fef08a');
      // Exhaust Smoke
      const smokeOffset = (Date.now() / 80) % 6;
      px(-2 - smokeOffset, 9, 3, 2, 'rgba(55, 65, 81, 0.8)');
      px(-5 - smokeOffset, 7, 4, 3, 'rgba(75, 85, 99, 0.6)');
    } else if (type === 'carbon_cloud') {
      // Dark toxic greenhouse gas cloud
      const pulse = Math.sin(Date.now() / 200) * 1.5;
      px(3, 4 + pulse, 10, 8, '#334155');
      px(1, 6 + pulse, 14, 5, '#1e293b');
      px(4, 2 + pulse, 8, 4, '#475569');
      // Emission skull/skull eyes in cloud
      px(5, 6 + pulse, 2, 2, '#f87171');
      px(9, 6 + pulse, 2, 2, '#f87171');
      // Label
      ctx.fillStyle = '#fca5a5';
      ctx.font = '9px Galmuri11, monospace';
      ctx.fillText('CO₂', x + width * 0.3, y + height * 0.95);
    } else if (type === 'factory_smoke') {
      // Chimney
      px(4, 5, 8, 11, '#64748b');
      px(3, 4, 10, 2, '#475569');
      // Warning stripe
      px(4, 9, 8, 2, '#f59e0b');
      // Plume
      const f = (Date.now() / 100) % 8;
      px(3, -2 - f, 10, 6, 'rgba(71, 85, 105, 0.85)');
      px(1, -6 - f, 14, 6, 'rgba(51, 65, 85, 0.6)');
    } else {
      // Deforestation: cut tree stump
      px(4, 7, 8, 9, '#78350f');
      px(3, 6, 10, 3, '#92400e');
      px(5, 7, 6, 1, '#d97706'); // Growth rings
      // Chainsaw blade
      px(8, 2, 6, 4, '#94a3b8');
      px(12, 1, 2, 2, '#ef4444');
    }
    ctx.restore();
  }

  /**
   * Draw Collectibles: Seed, Solar, Wind, Coin, Barrier
   */
  static drawItem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ) {
    ctx.save();
    const floatOffset = Math.sin(Date.now() / 150) * 3;
    const drawY = y + floatOffset;
    const p = width / 14;

    const px = (gx: number, gy: number, w: number, h: number, col: string) => {
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x + gx * p), Math.round(drawY + gy * p), Math.round(w * p), Math.round(h * p));
    };

    if (type === 'seed') {
      // Glowing Seed with Sprout
      px(5, 7, 4, 5, '#92400e');
      px(4, 8, 6, 3, '#78350f');
      // Sprouting green leaf
      px(6, 4, 2, 4, '#22c55e');
      px(8, 2, 3, 3, '#4ade80');
      px(4, 3, 3, 2, '#16a34a');
      // Sparkle glow
      ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
      ctx.beginPath();
      ctx.arc(x + width / 2, drawY + height / 2, width * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'solar') {
      // Solar Panel
      px(2, 4, 10, 7, '#2563eb');
      px(1, 3, 12, 1, '#60a5fa');
      // Solar Grid lines
      px(5, 4, 1, 7, '#93c5fd');
      px(8, 4, 1, 7, '#93c5fd');
      px(2, 7, 10, 1, '#93c5fd');
      px(6, 11, 2, 3, '#94a3b8');
    } else if (type === 'wind') {
      // Mini wind turbine
      px(6, 7, 2, 7, '#e2e8f0');
      const angle = (Date.now() / 200) % (Math.PI * 2);
      ctx.translate(x + width / 2, drawY + 7 * p);
      ctx.rotate(angle);
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-2, -width * 0.6, 4, width * 0.6);
      }
    } else if (type === 'coin') {
      // Eco Coin
      const spin = Math.abs(Math.sin(Date.now() / 180));
      const w = Math.max(2, width * 0.8 * spin);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x + (width - w) / 2, drawY, w, height);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + (width - w * 0.6) / 2, drawY + height * 0.2, w * 0.6, height * 0.6);
    } else {
      // Barrier Shield
      px(3, 2, 8, 9, 'rgba(6, 182, 212, 0.8)');
      px(4, 3, 6, 7, '#22d3ee');
      px(6, 4, 2, 5, '#ffffff');
    }

    ctx.restore();
  }

  /**
   * Draw Planted Tree
   */
  static drawPlantedTree(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    growth: number // 0 to 1
  ) {
    ctx.save();
    const trunkHeight = 24 * growth;
    const crownRadius = 20 * growth;

    // Trunk
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(x - 4, y - trunkHeight, 8, trunkHeight);

    // Foliage
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(x, y - trunkHeight - crownRadius * 0.6, crownRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x - crownRadius * 0.2, y - trunkHeight - crownRadius * 0.8, crownRadius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Flowers / fruits
    if (growth >= 0.8) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x - 8, y - trunkHeight - 12, 3, 3);
      ctx.fillRect(x + 6, y - trunkHeight - 8, 3, 3);
    }
    ctx.restore();
  }

  /**
   * Draw Boss: Glacier Melting Titan (지구열화 빙하거인)
   */
  static drawBoss(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    hp: number,
    maxHp: number,
    phase: number
  ) {
    ctx.save();
    const shake = phase === 2 ? Math.sin(Date.now() / 50) * 3 : 0;
    const bx = x + shake;
    const by = y;

    // Boss Body - Giant Melting Glacier Golem
    const gradient = ctx.createLinearGradient(bx, by, bx, by + height);
    gradient.addColorStop(0, '#0284c7'); // Ice blue
    gradient.addColorStop(0.5, '#38bdf8');
    gradient.addColorStop(1, '#ea580c'); // Magma melting heat at bottom!

    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Rough crystal/titan shape
    ctx.moveTo(bx + width * 0.2, by);
    ctx.lineTo(bx + width * 0.8, by);
    ctx.lineTo(bx + width, by + height * 0.4);
    ctx.lineTo(bx + width * 0.85, by + height);
    ctx.lineTo(bx + width * 0.15, by + height);
    ctx.lineTo(bx, by + height * 0.4);
    ctx.closePath();
    ctx.fill();

    // Hot melting veins / cracks
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + width * 0.3, by + height * 0.3);
    ctx.lineTo(bx + width * 0.5, by + height * 0.5);
    ctx.lineTo(bx + width * 0.4, by + height * 0.8);
    ctx.moveTo(bx + width * 0.7, by + height * 0.25);
    ctx.lineTo(bx + width * 0.6, by + height * 0.65);
    ctx.stroke();

    // Fierce glowing eyes
    const eyeGlow = Math.sin(Date.now() / 120) > 0 ? '#ef4444' : '#fbbf24';
    ctx.fillStyle = eyeGlow;
    ctx.fillRect(bx + width * 0.3, by + height * 0.25, width * 0.12, height * 0.08);
    ctx.fillRect(bx + width * 0.58, by + height * 0.25, width * 0.12, height * 0.08);

    // Steam / Hot melting particles rising
    for (let i = 0; i < 4; i++) {
      const px = bx + (i * width) / 4 + Math.sin(Date.now() / 150 + i) * 6;
      const py = by - 10 - ((Date.now() / 50 + i * 20) % 30);
      ctx.fillStyle = 'rgba(254, 215, 170, 0.4)';
      ctx.beginPath();
      ctx.arc(px, py, 6 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar above Boss
    const barWidth = width * 1.3;
    const barHeight = 12;
    const barX = bx - (barWidth - width) / 2;
    const barY = by - 26;

    // Background & Border
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // Boss Name & HP
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Galmuri11, monospace';
    ctx.textAlign = 'center';
    const currentHp = Math.max(0, Math.ceil(hp));
    ctx.fillText(`지구열화 빙하거인 [${currentHp} / ${maxHp} HP]`, bx + width / 2, barY - 6);

    ctx.restore();
  }

  /**
   * Draw Goal Post / Climate Research Station
   */
  static drawGoalStation(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
    ctx.save();
    // Research base dome
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x + 40, y + height - 20, 35, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Antenna & Flag
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 40, y + height - 55);
    ctx.lineTo(x + 40, y - 40);
    ctx.stroke();

    // Green Eco Flag waving
    const wave = Math.sin(Date.now() / 200) * 4;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(x + 42, y - 40);
    ctx.lineTo(x + 85 + wave, y - 25);
    ctx.lineTo(x + 42, y - 10);
    ctx.closePath();
    ctx.fill();

    // Earth icon on flag
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + 56, y - 25, 7, 0, Math.PI * 2);
    ctx.fill();

    // Signpost
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Galmuri11, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 기후 연구소 도착', x + 40, y + height + 16);

    ctx.restore();
  }

  /**
   * Draw Sea Water Layer with pixel waves
   */
  static drawSeaWater(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    waterY: number,
    dangerLevel: number // 0 to 1
  ) {
    ctx.save();
    const time = Date.now() / 400;

    // Sea water color shifts from nice deep turquoise to murky/alarming dark ocean as danger grows
    const deepColor = dangerLevel > 0.7 
      ? 'rgba(15, 55, 90, 0.88)' 
      : 'rgba(14, 116, 144, 0.82)';

    ctx.fillStyle = deepColor;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(0, waterY);

    // Pixel wave crests
    const step = 20;
    for (let x = 0; x <= canvasWidth + step; x += step) {
      const wave = Math.sin(x * 0.03 + time) * 6 + Math.cos(x * 0.05 - time * 0.8) * 3;
      ctx.lineTo(x, waterY + wave);
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();

    // Wave foam highlight
    ctx.fillStyle = dangerLevel > 0.7 ? 'rgba(254, 202, 202, 0.5)' : 'rgba(255, 255, 255, 0.6)';
    for (let x = 0; x <= canvasWidth; x += 16) {
      const waveY = waterY + Math.sin(x * 0.03 + time) * 6 + Math.cos(x * 0.05 - time * 0.8) * 3;
      ctx.fillRect(x, waveY - 2, 10, 3);
    }

    ctx.restore();
  }
}
