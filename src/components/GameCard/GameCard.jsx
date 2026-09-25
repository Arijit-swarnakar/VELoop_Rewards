import { Link } from 'react-router-dom';
import styles from './GameCard.module.css';

export default function GameCard({ game }) {
  return (
    <article className={styles.card} aria-label={`${game.name} — ${game.genre}`}>
      {/* Artwork link to game home */}
      <Link
        to={`/games/${game.id}`}
        className={styles.artWrap}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={game.banner}
          alt={game.name}
          className={styles.art}
          loading="lazy"
          width={330}
          height={255}
        />
        <div className={styles.artOverlay} aria-hidden="true" />

        {/* Genre / Badge */}
        {game.badge ? (
          <span className={`${styles.badge} ${styles.badgeHighlight}`}>{game.badge}</span>
        ) : (
          <span className={styles.badge}>{game.genre}</span>
        )}

        {/* Playable indicator */}
        {game.playable && (
          <span className={styles.playableDot} aria-label="Playable game" title="Playable" />
        )}
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.infoRow}>
          <h3 className={styles.title}>
            <Link to={`/games/${game.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {game.name}
            </Link>
          </h3>
          <span className={styles.rating} aria-label={`Rating: ${game.rating}`}>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 14 }}>star</span>
            {game.rating}
          </span>
        </div>
        <p className={styles.desc}>{game.description}</p>
      </div>

      {/* Action footer */}
      <div className={styles.footer}>
        <div className={styles.cost} aria-label="Entry cost: 20 Tokens">
          <img src="/assets/images/token.jpeg" alt="Token" className={styles.tokenIcon} style={{ mixBlendMode: 'screen' }} />
          <span className={styles.costText}>20 Tokens</span>
        </div>

        <Link
          to={`/games/${game.id}`}
          className={styles.playBtn}
          aria-label={`Play ${game.name}`}
        >
          <span className={styles.playBtnInner}>
            Play Now
            <span className="material-symbols-outlined" style={{ fontSize: 14, transition: 'transform 0.2s' }}>arrow_forward</span>
          </span>
          {/* Shimmer */}
          <span className={styles.shimmer} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
