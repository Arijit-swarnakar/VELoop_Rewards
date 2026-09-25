import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getGame } from '../data/games';
import PlayNowButton from '../components/PlayNowButton/PlayNowButton';
import TokenCost from '../components/TokenCost/TokenCost';
import styles from './GameHomePage.module.css';

export default function GameHomePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { tokenBalance, addTokens } = useGame();
  const game = getGame(gameId);
  const [showInsufficient, setShowInsufficient] = useState(false);

  useEffect(() => {
    document.body.classList.add(styles.body);
    return () => document.body.classList.remove(styles.body);
  }, []);

  if (!game) {
    return (
      <div className={styles.notFound}>
        <h2>Game not found</h2>
        <Link to="/" className="back-link">← Back to Games</Link>
      </div>
    );
  }

  const handlePlay = () => {
    if (tokenBalance < game.tokenCost) {
      setShowInsufficient(true);
      return;
    }

    // Launch game directly into playable session
    navigate(`/games/${gameId}/play`);
  };

  const handleInsufficientClose = () => setShowInsufficient(false);

  const handleHowToPlay = () => {
    navigate(`/games/${gameId}/instructions`);
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <header className={styles.hero} style={{ backgroundImage: `url(${game.banner})` }}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.genre}>{game.genre}</span>
          <h1 className={styles.name}>{game.name}</h1>
          <p className={styles.tagline}>{game.tagline}</p>
        </div>
      </header>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Rating</span>
            <div className={styles.infoValue}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 16 }}>star</span>
              {game.rating}
            </div>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Players</span>
            <span className={styles.infoValue}>{game.players}</span>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Avg. Time</span>
            <span className={styles.infoValue}>{game.avgTime}</span>
          </div>
        </div>

        <p className={styles.description}>{game.description}</p>
      </section>

      {/* Action Section */}
      <section className={styles.actionSection}>
        <div className={styles.actionRow}>
          <TokenCost amount={game.tokenCost} size="lg" />
          {game.badge && (
            <span className={styles.badge}>{game.badge}</span>
          )}
        </div>

        <div className={styles.buttonGroup}>
          {game.playable ? (
            <>
              <PlayNowButton
                onClick={handlePlay}
                children="Play Now"
                size="lg"
                ariaLabel={`Play ${game.name}`}
                className={styles.playBtn}
              />

              <button
                type="button"
                onClick={handleHowToPlay}
                className={styles.howToBtn}
                aria-label={`View instructions for ${game.name}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  menu_book
                </span>
                How to Play
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: '100%' }}>
              <button
                type="button"
                onClick={handleHowToPlay}
                className={styles.howToBtn}
                style={{ flex: 1, minWidth: 200, padding: '12px 20px', background: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.3)', color: '#a4c9ff' }}
                aria-label={`View game guide for ${game.name}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>menu_book</span>
                View Game Guide &amp; Rules
              </button>
              <span className={styles.comingSoon}>Gameplay In Development</span>
            </div>
          )}
        </div>
      </section>

      {/* Insufficient Tokens Modal */}
      {showInsufficient && (
        <div className={styles.modalOverlay} onClick={handleInsufficientClose} role="dialog" aria-modal="true" aria-labelledby="insufficient-title">
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 id="insufficient-title" className={styles.modalTitle}>Insufficient Tokens</h2>
            <p className={styles.modalText}>
              You need <strong>{game.tokenCost} Tokens</strong> to play <strong>{game.name}</strong>.<br />
              Your current balance: <strong>{tokenBalance} Tokens</strong>.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  addTokens(50);
                  setShowInsufficient(false);
                }}
                className={styles.modalBtnPrimary}
              >
                + Add 50 Demo Tokens (Free Refill)
              </button>
              <button
                type="button"
                onClick={() => {
                  handleInsufficientClose();
                  navigate('/redeem');
                }}
                className={styles.modalBtnSecondary}
              >
                Convert Coins to Tokens
              </button>
              <button type="button" onClick={handleInsufficientClose} className={styles.modalBtnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}