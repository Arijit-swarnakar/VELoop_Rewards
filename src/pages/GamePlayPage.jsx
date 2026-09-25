import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getGame } from '../data/games';
import BladeMasterGame from '../components/BladeMasterGame/BladeMasterGame';
import BlockCrushGame from '../components/BlockCrushGame/BlockCrushGame';
import styles from './GamePlayPage.module.css';

export default function GamePlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { tokenBalance, deductTokens, addCoins, recordResult, addTokens } = useGame();
  const game = getGame(gameId);

  const [sessionActive, setSessionActive] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOverData, setGameOverData] = useState(null); // { score, coins, stage/level }
  const [reviveKey, setReviveKey] = useState(0); // increment to remount/resume
  const [savedProgress, setSavedProgress] = useState(null);

  const sessionDeducted = useRef(false);

  // Validate and deduct tokens once upon session start
  useEffect(() => {
    if (!game || !game.playable) return;
    if (sessionActive || sessionDeducted.current) return;

    if (tokenBalance < game.tokenCost) {
      setShowInsufficient(true);
    } else {
      const ok = deductTokens(game.tokenCost);
      if (ok) {
        sessionDeducted.current = true;
        setSessionActive(true);
      } else {
        setShowInsufficient(true);
      }
    }
  }, [game, tokenBalance, deductTokens, sessionActive]);

  const handleGameOver = useCallback((finalScore, finalCoins, currentProgress) => {
    setGameOverData({
      score: finalScore,
      coins: finalCoins,
      progress: currentProgress,
    });
  }, []);

  // Revive action (1-time free demo revive)
  const handleRevive = () => {
    if (!gameOverData) return;
    setSavedProgress({
      stage: gameOverData.progress,
      score: gameOverData.score,
      coins: gameOverData.coins,
    });
    setGameOverData(null);
    setIsPaused(false);
    setReviveKey((k) => k + 1);
  };

  // No Thanks / End Session action
  const handleEndSession = () => {
    if (!gameOverData || !game) {
      navigate(`/games/${gameId}`);
      return;
    }

    const totalCoinsEarned = (gameOverData.coins || 0) + (game.coinReward || 200);

    // Credit shared Game Coin balance once
    addCoins(totalCoinsEarned);

    // Record session history
    recordResult({
      id: `session-${Date.now()}`,
      gameId: game.id,
      gameName: game.name,
      score: gameOverData.score,
      coinsEarned: totalCoinsEarned,
      timestamp: new Date().toISOString(),
    });

    // Navigate to game home
    navigate(`/games/${gameId}`);
  };

  const handleTogglePause = () => {
    setIsPaused((p) => !p);
  };

  if (!game) {
    return (
      <div className={styles.page}>
        <div className={styles.comingSoonCard}>
          <h2 className={styles.comingSoonTitle}>Game Not Found</h2>
          <p className={styles.comingSoonText}>The requested game does not exist.</p>
          <Link to="/" className={styles.btnPrimary}>Return to Games Catalog</Link>
        </div>
      </div>
    );
  }

  if (!game.playable) {
    return (
      <div className={styles.page}>
        <div className={styles.comingSoonCard}>
          <span className={`material-symbols-outlined ${styles.comingSoonIcon}`}>
            construction
          </span>
          <h2 className={styles.comingSoonTitle}>{game.name} is in Development</h2>
          <p className={styles.comingSoonText}>
            This title is currently part of our preview catalog. Full playable mechanics are currently live for <strong>Blade Master</strong> and <strong>Block Crush</strong>.
          </p>
          <div className={styles.modalActions}>
            <Link to={`/games/${game.id}/instructions`} className={styles.btnPrimary}>
              View Game Guide & Instructions
            </Link>
            <Link to="/" className={styles.btnSecondary}>
              Back to Arcade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <Link to={`/games/${game.id}`} className={styles.backBtn} aria-label="Exit Game">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Exit Game
        </Link>

        <div className={styles.matchBadge}>
          <span className={styles.pulseDot} />
          <span>LIVE SESSION • {game.name}</span>
        </div>
      </div>

      {/* Main Playable Arena */}
      {sessionActive && (
        <>
          {game.id === 'blade-master' && (
            <BladeMasterGame
              key={`blade-master-${reviveKey}`}
              onGameOver={handleGameOver}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              initialStage={savedProgress?.stage || 1}
              initialScore={savedProgress?.score || 0}
              initialCoins={savedProgress?.coins || 0}
            />
          )}

          {game.id === 'block-crush' && (
            <BlockCrushGame
              key={`block-crush-${reviveKey}`}
              onGameOver={handleGameOver}
              isPaused={isPaused}
              onTogglePause={handleTogglePause}
              initialLevel={savedProgress?.stage || 1}
              initialScore={savedProgress?.score || 0}
              initialCoins={savedProgress?.coins || 0}
            />
          )}
        </>
      )}

      {/* Insufficient Tokens Modal */}
      {showInsufficient && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="token-error-title">
          <div className={styles.modal}>
            <div className={`${styles.modalIcon} ${styles.modalIconWarning}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                toll
              </span>
            </div>
            <h2 id="token-error-title" className={styles.modalTitle}>Insufficient Tokens</h2>
            <p className={styles.modalDesc}>
              You need <strong>{game.tokenCost} Tokens</strong> to start a session in <strong>{game.name}</strong>.<br />
              Your current balance is <strong>{tokenBalance} Tokens</strong>.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  addTokens(50);
                  setShowInsufficient(false);
                  sessionDeducted.current = false;
                }}
              >
                + Add 50 Demo Tokens &amp; Start
              </button>
              <Link to="/redeem" className={styles.btnSecondary}>
                Convert Game Coins to Tokens
              </Link>
              <Link to={`/games/${game.id}`} className={styles.btnTertiary}>
                Back to Game Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && !gameOverData && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div className={styles.modal}>
            <div className={`${styles.modalIcon} ${styles.modalIconSuccess}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                pause_circle
              </span>
            </div>
            <h2 id="pause-title" className={styles.modalTitle}>Game Paused</h2>
            <p className={styles.modalDesc}>
              Take a breath! Press Resume or Spacebar to continue your run.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnPrimary} onClick={() => setIsPaused(false)}>
                Resume Gameplay
              </button>
              <Link to={`/games/${game.id}/instructions`} className={styles.btnSecondary}>
                Review Instructions
              </Link>
              <Link to={`/games/${game.id}`} className={styles.btnTertiary}>
                Exit Session
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Revive / Payout Modal */}
      {gameOverData && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="gameover-title">
          <div className={styles.modal}>
            <div className={`${styles.modalIcon} ${styles.modalIconOver}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                sports_score
              </span>
            </div>
            <h2 id="gameover-title" className={styles.modalTitle}>Session Complete</h2>
            <p className={styles.modalDesc}>
              Great effort in {game.name}! Choose to revive and keep your run alive, or collect your rewards.
            </p>

            {/* Score & Coin Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Final Score</span>
                <span className={styles.statValue}>{gameOverData.score.toLocaleString()}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Payout</span>
                <span className={`${styles.statValue} ${styles.statCoins}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>monetization_on</span>
                  +{((gameOverData.coins || 0) + (game.coinReward || 200)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Revive Policy Notice */}
            <div className={styles.revivePolicy}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
              <span>Demo Mode: 1-Time Revive with 0 Token charge</span>
            </div>

            {/* Actions */}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleRevive}
                aria-label="Revive and continue run"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>replay</span>
                Revive &amp; Continue Run
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleEndSession}
                aria-label="Collect rewards and return home"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                No Thanks — Collect Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
