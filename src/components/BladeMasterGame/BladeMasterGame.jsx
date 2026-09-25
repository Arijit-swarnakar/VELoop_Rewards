import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './BladeMasterGame.module.css';

/**
 * Blade Master! — Playable Knife-Throwing Target Accuracy Arena
 * Features:
 * - Rotating target log with dynamic speed and direction reversals (Stage 2+)
 * - Blade physics, precision collision detection against embedded blades
 * - Sliceable bonus targets (apples and coin tokens)
 * - Multiple escalating stages
 * - Responsive high-DPI canvas
 */

export default function BladeMasterGame({
  onGameOver,
  isPaused = false,
  onTogglePause,
  initialStage = 1,
  initialScore = 0,
  initialCoins = 0,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // React state for HUD
  const [stage, setStage] = useState(initialStage);
  const [score, setScore] = useState(initialScore);
  const [coins, setCoins] = useState(initialCoins);
  const [daggersRemaining, setDaggersRemaining] = useState(5);
  const [stageGoal, setStageGoal] = useState(5);
  const [bannerText, setBannerText] = useState(`STAGE ${initialStage}`);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio synthesize with Web Audio API (graceful fallback)
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
      if (type === 'throw') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'bonus') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'deflect') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'stage') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio not supported / allowed
    }
  }, [soundEnabled]);

  // Engine state kept in refs for 60fps canvas loop
  const gameState = useRef({
    stage: initialStage,
    score: initialScore,
    coins: initialCoins,
    daggersRemaining: 5,
    stageGoal: 5,
    wheelAngle: 0,
    wheelSpeed: 0.035, // radians per frame
    wheelBaseSpeed: 0.035,
    reversalTimer: 0,
    wheelShake: 0,
    embeddedBlades: [], // array of relative angles in radians
    bonusTargets: [],   // array of { angle, type: 'apple' | 'coin', hit: false }
    flyingDagger: null, // { y, speed }
    readyDagger: true,
    particles: [],      // spark / slice particles
    floatingTexts: [],  // [{ text, x, y, opacity, color }]
    deflectedDagger: null, // { x, y, vx, vy, angle, vAngle }
    gameOverTriggered: false,
    clearingStage: false,
  });

  // Stage setup helper
  const setupStage = useCallback((stg) => {
    const gs = gameState.current;
    gs.stage = stg;
    const goal = Math.min(5 + (stg - 1) * 2, 11);
    gs.stageGoal = goal;
    gs.daggersRemaining = goal;
    gs.embeddedBlades = [];
    gs.bonusTargets = [];
    gs.flyingDagger = null;
    gs.readyDagger = true;
    gs.deflectedDagger = null;
    gs.clearingStage = false;

    // Base speed scales with stage
    const baseSpd = 0.03 + (stg - 1) * 0.008;
    gs.wheelBaseSpeed = baseSpd;
    gs.wheelSpeed = baseSpd;
    gs.reversalTimer = 0;

    // Add 1-2 pre-embedded blades in stage 2+
    if (stg >= 2) {
      const preCount = Math.min(stg - 1, 3);
      for (let i = 0; i < preCount; i++) {
        gs.embeddedBlades.push((Math.PI * 2 * (i + 1)) / (preCount + 1));
      }
    }

    // Add bonus targets (apples / coins)
    const bonusCount = 1 + (stg % 2);
    for (let b = 0; b < bonusCount; b++) {
      const bAngle = Math.random() * Math.PI * 2;
      gs.bonusTargets.push({
        angle: bAngle,
        type: b % 2 === 0 ? 'coin' : 'apple',
        hit: false,
      });
    }

    setStage(stg);
    setStageGoal(goal);
    setDaggersRemaining(goal);
    setBannerText(`STAGE ${stg}`);
    setTimeout(() => setBannerText(''), 1200);
    playSound('stage');
  }, [playSound]);

  // Throw blade handler
  const throwBlade = useCallback(() => {
    const gs = gameState.current;
    if (isPaused || gs.gameOverTriggered || gs.clearingStage) return;
    if (!gs.readyDagger || gs.flyingDagger !== null || gs.daggersRemaining <= 0) return;

    gs.flyingDagger = {
      y: 0.85, // start near bottom (normalized 0-1)
      speed: 0.045, // fast upward travel
    };
    gs.readyDagger = false;
    playSound('throw');
  }, [isPaused, playSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        throwBlade();
      } else if (e.code === 'KeyP') {
        onTogglePause?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [throwBlade, onTogglePause]);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    setupStage(initialStage);

    const updateLoop = () => {
      const gs = gameState.current;
      const width = canvas.width;
      const height = canvas.height;

      // Handle Resize / Retina
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

      // Clear Canvas
      ctx.clearRect(0, 0, w, h);

      // Target Wheel geometry
      const wheelX = w / 2;
      const wheelY = h * 0.28;
      const wheelRadius = Math.min(w * 0.22, 90);

      if (!isPaused && !gs.gameOverTriggered) {
        // Dynamic Wheel Rotation Physics
        gs.wheelAngle += gs.wheelSpeed;

        // Stage 3+ Dynamic Reversals
        if (gs.stage >= 3) {
          gs.reversalTimer += 1;
          if (gs.reversalTimer > 180) {
            // Decelerate, pause 0.2s, reverse direction
            gs.wheelSpeed *= -1;
            gs.reversalTimer = 0;
          }
        }

        // Wheel Shake Decay
        if (gs.wheelShake > 0) {
          gs.wheelShake *= 0.85;
          if (gs.wheelShake < 0.2) gs.wheelShake = 0;
        }

        // Flying Dagger update
        if (gs.flyingDagger) {
          gs.flyingDagger.y -= gs.flyingDagger.speed;
          const daggerTipY = gs.flyingDagger.y * h;
          const hitY = wheelY + wheelRadius;

          if (daggerTipY <= hitY) {
            // Contact with wheel!
            // Calculate contact angle relative to current wheel rotation
            // Contact happens at bottom of wheel: world angle = PI/2 (90 deg down)
            const contactWorldAngle = Math.PI / 2;
            let relAngle = (contactWorldAngle - gs.wheelAngle) % (Math.PI * 2);
            if (relAngle < 0) relAngle += Math.PI * 2;

            // Check collision with already embedded blades
            const collisionDist = 0.24; // radians (~14 degrees)
            let collided = false;
            for (const b of gs.embeddedBlades) {
              const diff = Math.abs(b - relAngle);
              const wrapDiff = Math.min(diff, Math.PI * 2 - diff);
              if (wrapDiff < collisionDist) {
                collided = true;
                break;
              }
            }

            if (collided) {
              // Collision Deflection! Game Over
              playSound('deflect');
              gs.flyingDagger = null;
              gs.wheelShake = 8;

              // Spark particles
              for (let p = 0; p < 25; p++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 6;
                gs.particles.push({
                  x: wheelX,
                  y: hitY,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  color: p % 2 === 0 ? '#ff4d4d' : '#ffea00',
                  size: 2 + Math.random() * 3,
                  alpha: 1,
                  decay: 0.03,
                });
              }

              // Deflected dagger bouncing down
              gs.deflectedDagger = {
                x: wheelX,
                y: hitY,
                vx: (Math.random() - 0.5) * 8,
                vy: 4 + Math.random() * 4,
                angle: 0,
                vAngle: (Math.random() - 0.5) * 0.4,
              };

              gs.floatingTexts.push({
                text: 'CLANG! DEFLECTED',
                x: wheelX,
                y: hitY + 30,
                opacity: 1,
                color: '#ff4d4d',
              });

              gs.gameOverTriggered = true;
              setTimeout(() => {
                onGameOver?.(gs.score, gs.coins, gs.stage);
              }, 1200);

            } else {
              // Clean Embed!
              playSound('hit');
              gs.wheelShake = 5;
              gs.embeddedBlades.push(relAngle);
              gs.flyingDagger = null;

              // Score update
              gs.score += 100;
              setScore(gs.score);

              // Embed impact particles
              for (let p = 0; p < 8; p++) {
                gs.particles.push({
                  x: wheelX,
                  y: hitY,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  color: '#e1e1f6',
                  size: 2,
                  alpha: 1,
                  decay: 0.05,
                });
              }

              // Check hit bonus targets
              for (const tgt of gs.bonusTargets) {
                if (!tgt.hit) {
                  const bDiff = Math.abs(tgt.angle - relAngle);
                  const bWrapDiff = Math.min(bDiff, Math.PI * 2 - bDiff);
                  if (bWrapDiff < 0.28) {
                    tgt.hit = true;
                    playSound('bonus');
                    const bonusVal = tgt.type === 'coin' ? 50 : 30;
                    gs.coins += bonusVal;
                    setCoins(gs.coins);
                    gs.floatingTexts.push({
                      text: `+${bonusVal} COINS!`,
                      x: wheelX,
                      y: hitY - 20,
                      opacity: 1,
                      color: '#ffb95f',
                    });
                    // Slice particles
                    for (let p = 0; p < 15; p++) {
                      gs.particles.push({
                        x: wheelX,
                        y: hitY,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        color: tgt.type === 'coin' ? '#ffddb8' : '#ff4d4d',
                        size: 3,
                        alpha: 1,
                        decay: 0.03,
                      });
                    }
                  }
                }
              }

              // Decrement remaining daggers
              gs.daggersRemaining -= 1;
              setDaggersRemaining(gs.daggersRemaining);

              if (gs.daggersRemaining <= 0) {
                // Stage Cleared!
                gs.clearingStage = true;
                playSound('stage');
                gs.coins += 100;
                setCoins(gs.coins);

                gs.floatingTexts.push({
                  text: 'STAGE CLEAR! +100 COINS',
                  x: wheelX,
                  y: wheelY,
                  opacity: 1,
                  color: '#60a5fa',
                });

                // Clear stage explosion particles
                for (let p = 0; p < 40; p++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 3 + Math.random() * 7;
                  gs.particles.push({
                    x: wheelX,
                    y: wheelY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: p % 2 === 0 ? '#60a5fa' : '#a4c9ff',
                    size: 3 + Math.random() * 3,
                    alpha: 1,
                    decay: 0.02,
                  });
                }

                setTimeout(() => {
                  setupStage(gs.stage + 1);
                }, 1400);

              } else {
                // Ready next dagger after slight delay
                setTimeout(() => {
                  if (!gs.gameOverTriggered && !gs.clearingStage) {
                    gs.readyDagger = true;
                  }
                }, 100);
              }
            }
          }
        }

        // Deflected dagger animation
        if (gs.deflectedDagger) {
          const dd = gs.deflectedDagger;
          dd.x += dd.vx;
          dd.y += dd.vy;
          dd.vy += 0.35; // gravity
          dd.angle += dd.vAngle;
        }

        // Particle updates
        for (let i = gs.particles.length - 1; i >= 0; i--) {
          const p = gs.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          if (p.alpha <= 0) gs.particles.splice(i, 1);
        }

        // Floating texts update
        for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
          const ft = gs.floatingTexts[i];
          ft.y -= 1;
          ft.opacity -= 0.015;
          if (ft.opacity <= 0) gs.floatingTexts.splice(i, 1);
        }
      }

      // ================= DRAWING SECTION =================
      const shakeOffset = gs.wheelShake > 0 ? (Math.random() - 0.5) * gs.wheelShake : 0;
      const targetCenterX = wheelX + shakeOffset;
      const targetCenterY = wheelY;

      // 1. Draw Target Wheel (Wood Matrix & Steel Rim)
      ctx.save();
      ctx.translate(targetCenterX, targetCenterY);
      ctx.rotate(gs.wheelAngle);

      // Outer steel rim glow
      const rimGrad = ctx.createRadialGradient(0, 0, wheelRadius * 0.8, 0, 0, wheelRadius);
      rimGrad.addColorStop(0, '#3a3d54');
      rimGrad.addColorStop(0.85, '#20233b');
      rimGrad.addColorStop(1, '#60a5fa');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      // Wood log grain face
      const woodGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, wheelRadius * 0.9);
      woodGrad.addColorStop(0, '#533a21');
      woodGrad.addColorStop(0.5, '#3e2a16');
      woodGrad.addColorStop(0.9, '#26190c');
      woodGrad.addColorStop(1, '#1b1208');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.arc(0, 0, wheelRadius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Wood log rings
      ctx.strokeStyle = 'rgba(255, 200, 140, 0.15)';
      ctx.lineWidth = 1.5;
      for (let r = 20; r < wheelRadius * 0.85; r += 16) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center core badge
      const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      coreGrad.addColorStop(0, '#60a5fa');
      coreGrad.addColorStop(1, '#101221');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a4c9ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Bonus Targets on Wheel
      for (const tgt of gs.bonusTargets) {
        if (!tgt.hit) {
          ctx.save();
          ctx.rotate(tgt.angle);
          const tgtDist = wheelRadius * 0.82;
          ctx.translate(0, tgtDist);

          if (tgt.type === 'coin') {
            // Gold token coin
            ctx.fillStyle = '#ffb95f';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#2a1700';
            ctx.font = 'bold 9px Sora, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('V', 0, 0);
          } else {
            // Red apple
            ctx.fillStyle = '#ff4d4d';
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(-1, -12, 2, 4);
          }
          ctx.restore();
        }
      }

      // Draw Embedded Blades (rotating with the wheel)
      for (const bladeAngle of gs.embeddedBlades) {
        ctx.save();
        ctx.rotate(bladeAngle);
        // Position blade sticking out from log surface
        ctx.translate(0, wheelRadius);
        drawBladeShape(ctx, 0, 0, true);
        ctx.restore();
      }

      ctx.restore(); // end target wheel draw

      // 2. Draw Flying Dagger (in motion)
      if (gs.flyingDagger) {
        const fy = gs.flyingDagger.y * h;
        ctx.save();
        ctx.translate(wheelX, fy);
        drawBladeShape(ctx, 0, 0, false);
        ctx.restore();
      }

      // 3. Draw Ready Dagger at Launch Pad
      if (gs.readyDagger && !gs.flyingDagger && !gs.gameOverTriggered && gs.daggersRemaining > 0) {
        const readyY = h * 0.85;
        ctx.save();
        ctx.translate(wheelX, readyY);
        drawBladeShape(ctx, 0, 0, false);
        ctx.restore();
      }

      // 4. Draw Deflected Dagger (if collided)
      if (gs.deflectedDagger) {
        const dd = gs.deflectedDagger;
        ctx.save();
        ctx.translate(dd.x, dd.y);
        ctx.rotate(dd.angle);
        drawBladeShape(ctx, 0, 0, false);
        ctx.restore();
      }

      // 5. Draw Particles
      for (const p of gs.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Draw Floating Texts
      for (const ft of gs.floatingTexts) {
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
  }, [initialStage, isPaused, playSound, onGameOver, setupStage]);

  // Helper to draw realistic metallic dagger
  const drawBladeShape = (ctx, x, y, isEmbedded) => {
    ctx.save();
    ctx.translate(x, y);

    if (isEmbedded) {
      // Blade is embedded into log, pointing away from log center
      // Handle & guard sticking out
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(-2.5, 0, 5, 22);

      // Pommel & Guard
      ctx.fillStyle = '#d4e4fa';
      ctx.fillRect(-8, 20, 16, 4);

      // Handle grip
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, 24, 6, 16);
      ctx.fillStyle = '#ffb95f';
      ctx.fillRect(-4, 40, 8, 4);
    } else {
      // Dagger pointing upward towards log
      // Steel blade
      const bladeGrad = ctx.createLinearGradient(-5, 0, 5, 0);
      bladeGrad.addColorStop(0, '#cbd5e1');
      bladeGrad.addColorStop(0.5, '#ffffff');
      bladeGrad.addColorStop(1, '#94a3b8');

      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(0, -38); // sharp tip
      ctx.lineTo(6, -6);
      ctx.lineTo(4, 0);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, -6);
      ctx.closePath();
      ctx.fill();

      // Center fuller groove
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, -2);
      ctx.stroke();

      // Guard
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-9, 0, 18, 4);

      // Grip handle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3.5, 4, 7, 18);

      // Pommel
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 24, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      className={styles.gameContainer}
      onClick={throwBlade}
      role="region"
      aria-label="Blade Master Gameplay Arena"
      tabIndex={0}
    >
      {/* Top HUD */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          <div className={styles.stageBadge}>Stage {stage}</div>
          <div className={styles.scoreBadge}>{score} PTS</div>
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

      {/* Dagger Magazine Rack */}
      <div className={styles.daggerRack} aria-label={`${daggersRemaining} blades remaining`}>
        {Array.from({ length: stageGoal }).map((_, i) => (
          <div
            key={i}
            className={`${styles.rackDagger} ${i >= daggersRemaining ? styles.rackDaggerUsed : ''}`}
          >
            <span className={`material-symbols-outlined ${styles.rackDaggerIcon}`}>
              stat_3
            </span>
          </div>
        ))}
      </div>

      {/* Tap Instruction Hint */}
      <div className={styles.tapHint}>
        Tap screen or press Spacebar to throw blade
      </div>

      {/* Stage Announcement Banner */}
      {bannerText && (
        <div className={styles.stageOverlay}>
          <h2 className={styles.stageTitle}>{bannerText}</h2>
          <p className={styles.stageSubtitle}>Hit the target • Avoid existing blades</p>
        </div>
      )}

      {/* Game Canvas */}
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
