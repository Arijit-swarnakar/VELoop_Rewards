import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getGame } from '../data/games';
import PlayNowButton from '../components/PlayNowButton/PlayNowButton';
import TokenCost from '../components/TokenCost/TokenCost';
import styles from './GameInstructionsPage.module.css';

export default function GameInstructionsPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { acknowledgeGuide, guideAcknowledged, tokenBalance } = useGame();
  const game = getGame(gameId);
  const hasGuide = guideAcknowledged?.[gameId];

  useEffect(() => {
    document.body.classList.add(styles.body);
    return () => document.body.classList.remove(styles.body);
  }, []);

  if (!game) {
    return (
      <div className={styles.notFound}>
        <h2>Game not found</h2>
        <Link to="/" className={styles.backLink}>← Back to Games</Link>
      </div>
    );
  }

  const handleAcknowledge = () => {
    acknowledgeGuide(gameId);
    if (game.playable) {
      navigate(`/games/${gameId}/play`);
    } else {
      navigate(`/games/${gameId}`);
    }
  };

  const isBladeMaster = game.id === 'blade-master';
  const hasEnoughTokens = tokenBalance >= game.tokenCost;
  const balanceAfterPlay = Math.max(0, tokenBalance - game.tokenCost);

  // -------------------------------------------------------------------------
  // 1. Blade Master Specific Dark Theme Layout (Exact Stitch Reproduction)
  // Source: 04_blade_master_dark.html, 05_blade_master_mobile.html
  // -------------------------------------------------------------------------
  if (isBladeMaster) {
    return (
      <div className={styles.stitchPage}>
        {/* Top Breadcrumb Bar */}
        <div className={styles.stitchBreadcrumbBar}>
          <Link to={`/games/${gameId}`} className={styles.stitchBackBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Arcade
          </Link>
          <div className={styles.stitchMatchNode}>
            <span className={styles.stitchPulse} />
            <span>Secure Match: <strong style={{ color: '#fff' }}>#BM-8842-XP</strong></span>
          </div>
        </div>

        {/* Primary Stage Card in Sleek Dark Theme */}
        <section className={styles.stitchStageCard}>
          {/* Top Decorative Header Stripe */}
          <div className={styles.stitchHeroStripe}>
            <div className={styles.stitchHeroLeft}>
              <div className={styles.stitchThumb}>
                <img src={game.banner} alt="Blade Master Artwork" />
                <span className={styles.stitchNewBadge}>NEW</span>
              </div>
              <div className={styles.stitchHeroMeta}>
                <div className={styles.stitchPillsRow}>
                  <span className={styles.stitchPillPrimary}>Reflex &amp; Precision</span>
                  <span className={styles.stitchPillEmerald}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                    Instant Payout
                  </span>
                </div>
                <h1 className={styles.stitchGameTitle}>{game.name}</h1>
                <div className={styles.stitchRatingRow}>
                  <div className={styles.stitchRating}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                    <span>4.9</span>
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>(14,240 players)</span>
                  </div>
                  <span>•</span>
                  <span>Avg. 2 min / run</span>
                </div>
              </div>
            </div>

            <div className={styles.stitchYieldBox}>
              <span className={styles.stitchYieldLabel}>Est. Yield Per Run</span>
              <span className={styles.stitchYieldVal}>+250 Coins</span>
              <div className={styles.stitchTierXP}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>trending_up</span>
                +20 Tier XP
              </div>
            </div>
          </div>

          {/* Token Stake Bar */}
          <div className={styles.stitchStakeBar}>
            <div className={styles.stitchStakeLeft}>
              <div className={styles.stitchStakeIcon}>
                <img src="/assets/images/token.jpeg" alt="Token" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              </div>
              <div>
                <span className={styles.stitchStakeLabel}>
                  Standard Match Stake
                  <span style={{ background: 'rgba(255,185,95,0.15)', border: '1px solid rgba(255,185,95,0.3)', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>
                    Verified
                  </span>
                </span>
                <span className={styles.stitchStakeAmount}>20 <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Tokens Required</span></span>
              </div>
            </div>

            <div className={styles.stitchWalletChip}>
              <div className={styles.stitchWalletLeft}>
                <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 18 }}>account_balance_wallet</span>
                <div>
                  <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Current Wallet</span>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{tokenBalance} Tokens</span>
                </div>
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
              <span className={`${styles.stitchStatusPill} ${hasEnoughTokens ? styles.stitchStatusSuccess : styles.stitchStatusError}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {hasEnoughTokens ? 'check_circle' : 'error'}
                </span>
                {hasEnoughTokens ? 'Sufficient Balance' : 'Insufficient Tokens'}
              </span>
            </div>
          </div>

          {/* Tactical Briefing Body */}
          <div className={styles.stitchBody}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Tactical Briefing</span>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>How to Play &amp; Win</h3>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#34d399' }}>verified</span>
                  Fair Play Guaranteed
                </span>
              </div>

              {/* 4 Cards Grid */}
              <div className={styles.stitchCardsGrid}>
                {/* 01 Aim & Tap */}
                <div className={styles.stitchRuleCard}>
                  <div>
                    <div className={styles.stitchRuleTop}>
                      <span className={styles.stitchRuleIndex}>01</span>
                      <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 18 }}>touch_app</span>
                    </div>
                    <h4 className={styles.stitchRuleTitle}>Aim &amp; Tap</h4>
                    <p className={styles.stitchRuleDesc}>Click or tap to launch daggers into the revolving log.</p>
                  </div>
                  <div className={styles.stitchRuleBadge} style={{ color: '#60a5fa' }}>
                    <span>Primary Action</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
                  </div>
                </div>

                {/* 02 Avoid Deflection */}
                <div className={styles.stitchRuleCard}>
                  <div>
                    <div className={styles.stitchRuleTop}>
                      <span className={styles.stitchRuleIndex} style={{ color: '#f87171', background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)' }}>02</span>
                      <span className="material-symbols-outlined" style={{ color: '#f87171', fontSize: 18 }}>close</span>
                    </div>
                    <h4 className={styles.stitchRuleTitle}>Avoid Deflection</h4>
                    <p className={styles.stitchRuleDesc}>Never strike already embedded blades—one hit ends your run.</p>
                  </div>
                  <div className={styles.stitchRuleBadge} style={{ color: '#f87171' }}>
                    <span>Zero Margin</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                  </div>
                </div>

                {/* 03 Bonus Targets */}
                <div className={styles.stitchRuleCard}>
                  <div>
                    <div className={styles.stitchRuleTop}>
                      <span className={styles.stitchRuleIndex} style={{ color: '#ffb95f', background: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)' }}>03</span>
                      <span className="material-symbols-outlined" style={{ color: '#ffb95f', fontSize: 18 }}>stars</span>
                    </div>
                    <h4 className={styles.stitchRuleTitle}>Bonus Targets</h4>
                    <p className={styles.stitchRuleDesc}>Slice circulating tokens and apples for instant coin multipliers.</p>
                  </div>
                  <div className={styles.stitchRuleBadge} style={{ color: '#ffb95f' }}>
                    <span>+50 Bonus Coins</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>savings</span>
                  </div>
                </div>

                {/* 04 Claim Payout */}
                <div className={styles.stitchRuleCard}>
                  <div>
                    <div className={styles.stitchRuleTop}>
                      <span className={styles.stitchRuleIndex} style={{ color: '#34d399', background: 'rgba(52,211,153,0.2)', borderColor: 'rgba(52,211,153,0.3)' }}>04</span>
                      <span className="material-symbols-outlined" style={{ color: '#34d399', fontSize: 18 }}>emoji_events</span>
                    </div>
                    <h4 className={styles.stitchRuleTitle}>Claim Payout</h4>
                    <p className={styles.stitchRuleDesc}>Clear stages to lock in your coins and leaderboard rank.</p>
                  </div>
                  <div className={styles.stitchRuleBadge} style={{ color: '#34d399' }}>
                    <span>Instant Payout</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Controls & Pro Tip Row */}
            <div className={styles.stitchSplitRow}>
              {/* Controls */}
              <div className={styles.stitchControlsBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>gamepad</span>
                    Supported Controls
                  </span>
                  <span style={{ fontSize: 10, color: '#34d399', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', padding: '2px 6px', borderRadius: 10 }}>
                    &lt;10ms Latency
                  </span>
                </div>

                <div className={styles.stitchControlsGrid}>
                  <div className={styles.stitchControlKey}>
                    <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 20 }}>mouse</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Mouse</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Left Click</div>
                    </div>
                  </div>
                  <div className={styles.stitchControlKey}>
                    <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 20 }}>space_bar</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Spacebar</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Key Press</div>
                    </div>
                  </div>
                  <div className={styles.stitchControlKey}>
                    <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: 20 }}>touch_app</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Touch</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Tap Screen</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffb95f' }}>rotate_right</span>
                    Wheel reverses speed dynamically after Stage 2
                  </span>
                  <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>Stage 1: 30 RPM</span>
                </div>
              </div>

              {/* Pro Tip */}
              <div className={styles.stitchProTipBox}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ffb95f', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
                    Pro Tip
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    Don't spam taps. Launch blades right during the subtle <strong style={{ color: '#fff' }}>0.2s pause</strong> when the target wheel switches rotation direction.
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffb95f' }}>stars</span>
                    5x Streak Multiplier
                  </div>
                  <span style={{ color: '#34d399', fontSize: 10, fontWeight: 600 }}>Active for VIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className={styles.stitchActionBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#181b2e', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance_wallet</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Balance after play: <strong style={{ color: '#fff', fontSize: 14 }}>{balanceAfterPlay} Tokens</strong>
                </div>
                <div style={{ fontSize: 10, color: '#34d399', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
                  Auto-refunded if network disconnects
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.stitchBackBtn}
                onClick={handleAcknowledge}
                style={{ padding: '12px 18px', fontSize: 13 }}
              >
                Practice Mode (Free)
              </button>
              <button
                type="button"
                className={styles.stitchPlayNowBtn}
                onClick={handleAcknowledge}
                id="btn-play-now"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_circle</span>
                <span>Play Now</span>
                <span className={styles.stitchCostChip}>
                  <img src="/assets/images/token.jpeg" alt="" style={{ width: 14, height: 14, borderRadius: '50%' }} />
                  20 TOKENS
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Reassurance Notes */}
        <div className={styles.stitchReassurance}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#34d399' }}>lock</span>
            <span>256-Bit RNG Certified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#60a5fa' }}>groups</span>
            <span>1,842 Challengers In-Game Now</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Generic / Tailored Instructions Layout for All Other 12 Games
  // -------------------------------------------------------------------------
  const controls = game.instructions?.controls || [];
  const rules = game.instructions?.rules || [];
  const tips = game.instructions?.tips || [];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero} style={{ backgroundImage: `url(${game.banner})` }}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.genre}>{game.genre}</span>
          <h1 className={styles.name}>{game.name}</h1>
          <p className={styles.tagline}>Game Guide &amp; Tactical Briefing</p>
        </div>
      </header>

      {/* Content */}
      <section className={styles.content}>
        {/* Objective */}
        <article className={styles.section}>
          <h2 className={styles.sectionTitle}>Objective</h2>
          <p className={styles.sectionText}>{game.instructions?.objective || 'Objective not available.'}</p>
        </article>

        {/* Controls */}
        {controls.length > 0 && (
          <article className={styles.section}>
            <h2 className={styles.sectionTitle}>Controls</h2>
            <div className={styles.controlsGrid}>
              {controls.map((control) => (
                <div key={control.id} className={styles.controlCard}>
                  <div className={styles.controlIcon}>
                    <span className="material-symbols-outlined">{control.icon}</span>
                  </div>
                  <div className={styles.controlInfo}>
                    <h3 className={styles.controlTitle}>{control.title}</h3>
                    <p className={styles.controlBody}>{control.body}</p>
                  </div>
                  <span className={`${styles.controlAccent} ${styles[control.accent]}`}>{control.label}</span>
                </div>
              ))}
            </div>
          </article>
        )}

        {/* Rules */}
        {rules.length > 0 && (
          <article className={styles.section}>
            <h2 className={styles.sectionTitle}>Rules</h2>
            <ul className={styles.rulesList}>
              {rules.map((rule, i) => (
                <li key={i} className={styles.ruleItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  {rule}
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* Tips */}
        {tips.length > 0 && (
          <article className={styles.section}>
            <h2 className={styles.sectionTitle}>Tips</h2>
            <ul className={styles.tipsList}>
              {tips.map((tip, i) => (
                <li key={i} className={styles.tipItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
                  {tip}
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* Entry Note */}
        <article className={styles.section} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)' }}>
          <h2 className={styles.sectionTitle}>Entry Cost</h2>
          <div className={styles.entryNote}>
            <TokenCost amount={game.tokenCost} size="md" />
            <p className={styles.entryText}>{game.instructions?.entryNote || `Entry cost: ${game.tokenCost} Tokens per session.`}</p>
          </div>
        </article>
      </section>

      {/* Bottom Action */}
      <footer className={styles.footer}>
        <Link to={`/games/${gameId}`} className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Game Home
        </Link>

        {game.playable ? (
          <PlayNowButton
            onClick={handleAcknowledge}
            children={hasGuide ? 'Play Now' : 'I Understand — Play Now'}
            size="lg"
            className={styles.playBtn}
            ariaLabel={`Start playing ${game.name}`}
          />
        ) : (
          <button
            type="button"
            onClick={handleAcknowledge}
            className={styles.backLink}
            style={{ background: 'rgba(96,165,250,0.15)', color: '#a4c9ff', border: '1px solid rgba(96,165,250,0.3)', padding: '10px 20px' }}
          >
            Understood — Back to Overview
          </button>
        )}
      </footer>
    </div>
  );
}