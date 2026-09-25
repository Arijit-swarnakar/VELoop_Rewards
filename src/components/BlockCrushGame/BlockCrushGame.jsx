import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './BlockCrushGame.module.css';

/**
 * Block Crush — Playable Retro Neon Brick Breaker
 * Features:
 * - Prismatic numbered blocks with hitpoint durability
 * - Paddle physics with angled deflection based on hit position
 * - Power-up drops: Fire Ball, Multi Ball, Wide Paddle, Coin Drop
 * - 3 Lives system with heart HUD
 * - Level progression and escalating speeds
 * - Responsive high-DPI canvas
 */

export default function BlockCrushGame({
  onGameOver,
  isPaused = false,
  onTogglePause,
  initialLevel = 1,
  initialScore = 0,
  initialCoins = 0,
}) {
  const canvasRef = useRef(null);

  // HUD State
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(initialScore);
  const [coins, setCoins] = useState(initialCoins);
  const [lives, setLives] = useState(3);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [bannerText, setBannerText] = useState(`LEVEL ${initialLevel}`);
  const [ballLaunched, setBallLaunched] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Web Audio Synthesizer
  const audioCtxRef = useRef(null);
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'paddle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'brick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'powerup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        osc.frequency.setValueAtTime(784, now + 0.16);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'lose_life') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'level_clear') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2);
        osc.frequency.setValueAtTime(1046, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch {
      // Audio not permitted
    }
  }, [soundEnabled]);

  // Engine refs for 60fps loop
  const engine = useRef({
    level: initialLevel,
    score: initialScore,
    coins: initialCoins,
    lives: 3,
    paddle: { x: 0.5, y: 0.92, w: 0.22, baseW: 0.22, h: 0.022 },
    balls: [], // array of { x, y, vx, vy, radius: 7, isFire: false }
    bricks: [], // array of { x, y, w, h, hp, maxHp, color, points }
    powerUps: [], // array of { x, y, vy, type, label, color }
    particles: [],
    floatingTexts: [],
    fireBallTimer: 0,
    widePaddleTimer: 0,
    ballLaunched: false,
    clearingLevel: false,
    gameOverTriggered: false,
    keys: { left: false, right: false },
  });

  // Setup level layout
  const setupLevel = useCallback((lvl) => {
    const eg = engine.current;
    eg.level = lvl;
    eg.clearingLevel = false;
    eg.balls = [];
    eg.powerUps = [];
    eg.ballLaunched = false;
    eg.paddle.w = eg.paddle.baseW;
    eg.fireBallTimer = 0;
    eg.widePaddleTimer = 0;

    // Reset primary ball resting on paddle
    eg.balls = [{
      x: eg.paddle.x,
      y: eg.paddle.y - 0.03,
      vx: 0,
      vy: 0,
      radius: 6,
      isFire: false,
    }];

    // Generate bricks based on level
    const rows = 4 + Math.min(lvl, 3);
    const cols = 7;
    const bricks = [];
    const brickW = 0.12;
    const brickH = 0.032;
    const paddingX = 0.012;
    const paddingY = 0.012;
    const startX = (1 - (cols * brickW + (cols - 1) * paddingX)) / 2;
    const startY = 0.12;

    const rowColors = [
      { hp: 3, color: '#ec4899', border: '#f472b6', name: 'pink' },
      { hp: 2, color: '#8b5cf6', border: '#a78bfa', name: 'purple' },
      { hp: 2, color: '#06b6d4', border: '#22d3ee', name: 'cyan' },
      { hp: 1, color: '#10b981', border: '#34d399', name: 'emerald' },
      { hp: 1, color: '#f59e0b', border: '#fbbf24', name: 'amber' },
      { hp: 1, color: '#ef4444', border: '#f87171', name: 'red' },
      { hp: 1, color: '#3b82f6', border: '#60a5fa', name: 'blue' },
    ];

    for (let r = 0; r < rows; r++) {
      const rowCfg = rowColors[r % rowColors.length];
      const hp = Math.min(rowCfg.hp + Math.floor((lvl - 1) / 2), 4);
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (brickW + paddingX),
          y: startY + r * (brickH + paddingY),
          w: brickW,
          h: brickH,
          hp: hp,
          maxHp: hp,
          color: rowCfg.color,
          border: rowCfg.border,
          points: hp * 50,
        });
      }
    }

    eg.bricks = bricks;
    setLevel(lvl);
    setBallLaunched(false);
    setActivePowerUp(null);
    setBannerText(`LEVEL ${lvl}`);
    setTimeout(() => setBannerText(''), 1200);
    playSound('level_clear');
  }, [playSound]);

  // Launch resting ball
  const launchBall = useCallback(() => {
    const eg = engine.current;
    if (isPaused || eg.gameOverTriggered || eg.ballLaunched) return;
    if (eg.balls.length === 0) return;

    const speed = 0.009 + (eg.level - 1) * 0.0015;
    // Launch upward at a random slight angle
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    eg.balls[0].vx = Math.cos(angle) * speed;
    eg.balls[0].vy = Math.sin(angle) * speed;
    eg.ballLaunched = true;
    setBallLaunched(true);
    playSound('paddle');
  }, [isPaused, playSound]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        launchBall();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.current.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.current.keys.right = true;
      } else if (e.code === 'KeyP') {
        onTogglePause?.();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        engine.current.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        engine.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchBall, onTogglePause]);

  // Mouse / Touch paddle tracking
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const normX = (clientX - rect.left) / rect.width;
    const halfW = engine.current.paddle.w / 2;
    engine.current.paddle.x = Math.max(halfW, Math.min(1 - halfW, normX));

    // If ball not yet launched, lock ball to paddle
    if (!engine.current.ballLaunched && engine.current.balls.length > 0) {
      engine.current.balls[0].x = engine.current.paddle.x;
    }
  };

  // Main Canvas Render & Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    setupLevel(initialLevel);

    const updateLoop = () => {
      const eg = engine.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      if (!isPaused && !eg.gameOverTriggered) {
        // Keyboard paddle motion
        const paddleSpeed = 0.018;
        const halfW = eg.paddle.w / 2;
        if (eg.keys.left) {
          eg.paddle.x = Math.max(halfW, eg.paddle.x - paddleSpeed);
          if (!eg.ballLaunched && eg.balls[0]) eg.balls[0].x = eg.paddle.x;
        }
        if (eg.keys.right) {
          eg.paddle.x = Math.min(1 - halfW, eg.paddle.x + paddleSpeed);
          if (!eg.ballLaunched && eg.balls[0]) eg.balls[0].x = eg.paddle.x;
        }

        // Active power-up countdown timers
        if (eg.fireBallTimer > 0) {
          eg.fireBallTimer--;
          if (eg.fireBallTimer === 0) {
            eg.balls.forEach(b => b.isFire = false);
            setActivePowerUp(null);
          }
        }
        if (eg.widePaddleTimer > 0) {
          eg.widePaddleTimer--;
          if (eg.widePaddleTimer === 0) {
            eg.paddle.w = eg.paddle.baseW;
            setActivePowerUp(null);
          }
        }

        // Update Balls
        if (eg.ballLaunched) {
          for (let bIndex = eg.balls.length - 1; bIndex >= 0; bIndex--) {
            const ball = eg.balls[bIndex];
            ball.x += ball.vx;
            ball.y += ball.vy;

            const radiusNormX = ball.radius / w;
            const radiusNormY = ball.radius / h;

            // Wall Collisions
            if (ball.x - radiusNormX <= 0) {
              ball.x = radiusNormX;
              ball.vx = Math.abs(ball.vx);
              playSound('paddle');
            } else if (ball.x + radiusNormX >= 1) {
              ball.x = 1 - radiusNormX;
              ball.vx = -Math.abs(ball.vx);
              playSound('paddle');
            }

            if (ball.y - radiusNormY <= 0.08) {
              ball.y = 0.08 + radiusNormY;
              ball.vy = Math.abs(ball.vy);
              playSound('paddle');
            }

            // Paddle Collision
            const pTop = eg.paddle.y;
            const pBottom = eg.paddle.y + eg.paddle.h;
            const pLeft = eg.paddle.x - eg.paddle.w / 2;
            const pRight = eg.paddle.x + eg.paddle.w / 2;

            if (
              ball.vy > 0 &&
              ball.y + radiusNormY >= pTop &&
              ball.y - radiusNormY <= pBottom &&
              ball.x >= pLeft &&
              ball.x <= pRight
            ) {
              // Hit the paddle!
              playSound('paddle');
              const hitOffset = (ball.x - eg.paddle.x) / (eg.paddle.w / 2); // -1 to 1
              const maxAngle = (Math.PI / 180) * 60; // 60 deg max spread
              const currentSpeed = Math.hypot(ball.vx, ball.vy);
              const newAngle = -Math.PI / 2 + hitOffset * maxAngle;

              ball.vx = Math.cos(newAngle) * currentSpeed;
              ball.vy = Math.sin(newAngle) * currentSpeed;
              ball.y = pTop - radiusNormY;

              // Spark particles on paddle
              for (let i = 0; i < 6; i++) {
                eg.particles.push({
                  x: ball.x * w,
                  y: pTop * h,
                  vx: (Math.random() - 0.5) * 3,
                  vy: -Math.random() * 3,
                  color: '#60a5fa',
                  size: 2,
                  alpha: 1,
                  decay: 0.05,
                });
              }
            }

            // Brick Collisions
            for (let i = eg.bricks.length - 1; i >= 0; i--) {
              const brick = eg.bricks[i];
              if (
                ball.x + radiusNormX >= brick.x &&
                ball.x - radiusNormX <= brick.x + brick.w &&
                ball.y + radiusNormY >= brick.y &&
                ball.y - radiusNormY <= brick.y + brick.h
              ) {
                // Ball hits brick!
                playSound('brick');
                brick.hp -= 1;

                if (!ball.isFire) {
                  // Standard bounce: determine hit edge
                  const overlapLeft = (ball.x + radiusNormX) - brick.x;
                  const overlapRight = (brick.x + brick.w) - (ball.x - radiusNormX);
                  const overlapTop = (ball.y + radiusNormY) - brick.y;
                  const overlapBottom = (brick.y + brick.h) - (ball.y - radiusNormY);

                  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                  if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    ball.vx *= -1;
                  } else {
                    ball.vy *= -1;
                  }
                }

                // Brick hit particles
                for (let p = 0; p < 8; p++) {
                  eg.particles.push({
                    x: (brick.x + brick.w / 2) * w,
                    y: (brick.y + brick.h / 2) * h,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    color: brick.color,
                    size: 2.5,
                    alpha: 1,
                    decay: 0.04,
                  });
                }

                if (brick.hp <= 0) {
                  // Brick destroyed!
                  eg.score += brick.points;
                  setScore(eg.score);

                  // 25% Power-up Drop Chance
                  if (Math.random() < 0.28) {
                    const types = ['FIRE_BALL', 'MULTI_BALL', 'WIDE_PADDLE', 'COIN_DROP'];
                    const chosen = types[Math.floor(Math.random() * types.length)];
                    eg.powerUps.push({
                      x: brick.x + brick.w / 2,
                      y: brick.y + brick.h,
                      vy: 0.0035,
                      type: chosen,
                      label: chosen === 'FIRE_BALL' ? 'FIRE' :
                             chosen === 'MULTI_BALL' ? '+BALLS' :
                             chosen === 'WIDE_PADDLE' ? 'WIDE' : '+30 COIN',
                      color: chosen === 'FIRE_BALL' ? '#f97316' :
                             chosen === 'MULTI_BALL' ? '#3b82f6' :
                             chosen === 'WIDE_PADDLE' ? '#10b981' : '#f59e0b',
                    });
                  }

                  eg.bricks.splice(i, 1);
                }

                break; // handled collision for this ball
              }
            }

            // Ball fell past bottom
            if (ball.y - radiusNormY > 1.0) {
              eg.balls.splice(bIndex, 1);
            }
          }

          // Check if all balls lost
          if (eg.balls.length === 0) {
            eg.lives -= 1;
            setLives(eg.lives);
            playSound('lose_life');

            if (eg.lives <= 0) {
              // Game Over!
              eg.gameOverTriggered = true;
              setTimeout(() => {
                onGameOver?.(eg.score, eg.coins, eg.level);
              }, 1000);
            } else {
              // Reset ball on paddle
              eg.ballLaunched = false;
              setBallLaunched(false);
              eg.balls = [{
                x: eg.paddle.x,
                y: eg.paddle.y - 0.03,
                vx: 0,
                vy: 0,
                radius: 6,
                isFire: false,
              }];
            }
          }

          // Check Level Cleared
          if (eg.bricks.length === 0 && !eg.clearingLevel) {
            eg.clearingLevel = true;
            playSound('level_clear');
            eg.coins += 150;
            setCoins(eg.coins);

            eg.floatingTexts.push({
              text: 'LEVEL CLEAR! +150 COINS',
              x: w / 2,
              y: h / 2,
              opacity: 1,
              color: '#f472b6',
            });

            setTimeout(() => {
              setupLevel(eg.level + 1);
            }, 1400);
          }
        }

        // Update Power-Ups falling down
        for (let i = eg.powerUps.length - 1; i >= 0; i--) {
          const pu = eg.powerUps[i];
          pu.y += pu.vy;

          // Catch power-up with paddle
          const pTop = eg.paddle.y;
          const pLeft = eg.paddle.x - eg.paddle.w / 2;
          const pRight = eg.paddle.x + eg.paddle.w / 2;

          if (
            pu.y >= pTop &&
            pu.y <= pTop + eg.paddle.h + 0.02 &&
            pu.x >= pLeft &&
            pu.x <= pRight
          ) {
            // Power-up caught!
            playSound('powerup');

            if (pu.type === 'FIRE_BALL') {
              eg.fireBallTimer = 480; // ~8 seconds
              eg.balls.forEach(b => b.isFire = true);
              setActivePowerUp('🔥 Fire Ball Active!');
            } else if (pu.type === 'MULTI_BALL') {
              if (eg.balls.length > 0) {
                const b0 = eg.balls[0];
                const spd = Math.hypot(b0.vx, b0.vy) || 0.009;
                eg.balls.push(
                  { x: b0.x, y: b0.y, vx: b0.vx - 0.003, vy: b0.vy, radius: 6, isFire: b0.isFire },
                  { x: b0.x, y: b0.y, vx: b0.vx + 0.003, vy: b0.vy, radius: 6, isFire: b0.isFire }
                );
              }
              setActivePowerUp('⚡ Multi Ball Deployed!');
            } else if (pu.type === 'WIDE_PADDLE') {
              eg.paddle.w = eg.paddle.baseW * 1.5;
              eg.widePaddleTimer = 600; // ~10 seconds
              setActivePowerUp('🛡️ Wide Paddle Active!');
            } else if (pu.type === 'COIN_DROP') {
              eg.coins += 30;
              setCoins(eg.coins);
              eg.floatingTexts.push({
                text: '+30 COINS!',
                x: eg.paddle.x * w,
                y: pTop * h - 15,
                opacity: 1,
                color: '#ffb95f',
              });
            }

            eg.powerUps.splice(i, 1);
            continue;
          }

          // Off bottom of screen
          if (pu.y > 1.05) {
            eg.powerUps.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = eg.particles.length - 1; i >= 0; i--) {
          const p = eg.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          if (p.alpha <= 0) eg.particles.splice(i, 1);
        }

        // Update Floating Texts
        for (let i = eg.floatingTexts.length - 1; i >= 0; i--) {
          const ft = eg.floatingTexts[i];
          ft.y -= 1;
          ft.opacity -= 0.015;
          if (ft.opacity <= 0) eg.floatingTexts.splice(i, 1);
        }
      }

      // ================= DRAWING SECTION =================

      // 1. Draw Bricks
      for (const b of eg.bricks) {
        const bx = b.x * w;
        const by = b.y * h;
        const bw = b.w * w;
        const bh = b.h * h;

        // Brick body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();

        // Brick neon border
        ctx.strokeStyle = b.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // HP number inside brick
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.hp.toString(), bx + bw / 2, by + bh / 2);
      }

      // 2. Draw Falling Power-Ups
      for (const pu of eg.powerUps) {
        const pux = pu.x * w;
        const puy = pu.y * h;
        ctx.save();
        ctx.fillStyle = pu.color;
        ctx.beginPath();
        ctx.roundRect(pux - 22, puy - 10, 44, 20, 10);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.label, pux, puy);
        ctx.restore();
      }

      // 3. Draw Paddle
      const px = (eg.paddle.x - eg.paddle.w / 2) * w;
      const py = eg.paddle.y * h;
      const pw = eg.paddle.w * w;
      const ph = eg.paddle.h * h;

      // Paddle neon glow
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 12;

      const paddleGrad = ctx.createLinearGradient(px, py, px + pw, py);
      paddleGrad.addColorStop(0, '#3b82f6');
      paddleGrad.addColorStop(0.5, '#60a5fa');
      paddleGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 8);
      ctx.fill();

      // Top highlight strip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 4, py + 2, pw - 8, 2);
      ctx.shadowBlur = 0; // reset shadow

      // 4. Draw Balls
      for (const ball of eg.balls) {
        const bx = ball.x * w;
        const by = ball.y * h;

        ctx.save();
        if (ball.isFire) {
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#f97316';
        } else {
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
        }
        ctx.beginPath();
        ctx.arc(bx, by, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Draw Particles
      for (const p of eg.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw Floating Texts
      for (const ft of eg.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 15px Sora, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [initialLevel, isPaused, playSound, onGameOver, setupLevel]);

  return (
    <div
      className={styles.gameContainer}
      onClick={launchBall}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      role="region"
      aria-label="Block Crush Gameplay Arena"
      tabIndex={0}
    >
      {/* Top HUD */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          <div className={styles.levelBadge}>Level {level}</div>
          <div className={styles.scoreBadge}>{score} PTS</div>
          {/* 3 Lives display */}
          <div className={styles.livesRow} aria-label={`${lives} lives remaining`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`material-symbols-outlined ${i < lives ? styles.heartActive : styles.heartLost}`}
              >
                favorite
              </span>
            ))}
          </div>
        </div>

        <div className={styles.hudRight}>
          <div className={styles.coinsBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>monetization_on</span>
            +{coins}
          </div>
          <button
            type="button"
            className={styles.hudBtn}
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>
          <button
            type="button"
            className={styles.hudBtn}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePause?.();
            }}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
          </button>
        </div>
      </div>

      {/* Active Power-up Indicator */}
      {activePowerUp && (
        <div className={styles.powerUpPill}>
          {activePowerUp}
        </div>
      )}

      {/* Launch Prompt if ball resting */}
      {!ballLaunched && (
        <div className={styles.launchPrompt}>
          Tap screen or press Spacebar to launch ball
        </div>
      )}

      {/* Level Announcement Banner */}
      {bannerText && (
        <div className={styles.levelOverlay}>
          <h2 className={styles.levelTitle}>{bannerText}</h2>
          <p className={styles.levelSubtitle}>Break bricks • Collect power-ups</p>
        </div>
      )}

      {/* Game Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
