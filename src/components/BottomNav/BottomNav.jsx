import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const location = useLocation();
  const { coinBalance, tokenBalance } = useGame();

  const isHome = location.pathname === '/' || location.pathname.startsWith('/games');
  const isExplore = location.pathname === '/explore';
  const isRewards = location.pathname === '/rewards' || location.pathname === '/redeem';
  const isLeaderboard = location.pathname === '/leaderboard';

  return (
    <nav className={styles.bottomNav} aria-label="Quick navigation">
      <div className={styles.container}>
        <Link
          to="/"
          className={`${styles.navItem} ${isHome ? styles.active : ''}`}
          aria-label="Go to Games Catalog"
        >
          <span className="material-symbols-outlined">sports_esports</span>
          <span className={styles.label}>Games</span>
        </Link>

        <Link
          to="/explore"
          className={`${styles.navItem} ${isExplore ? styles.active : ''}`}
          aria-label="Go to Explore"
        >
          <span className="material-symbols-outlined">explore</span>
          <span className={styles.label}>Explore</span>
        </Link>

        <div className={styles.balancePill} title="Current balances">
          <div className={styles.balItem}>
            <img
              src="/assets/images/game-coin.jpeg"
              alt="Coin"
              className={styles.coinImg}
            />
            <span className={styles.coinNum}>{coinBalance.toLocaleString()}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.balItem}>
            <img
              src="/assets/images/token.jpeg"
              alt="Token"
              className={styles.tokenImg}
            />
            <span className={styles.tokenNum}>{tokenBalance}</span>
          </div>
        </div>

        <Link
          to="/rewards"
          className={`${styles.navItem} ${isRewards ? styles.active : ''}`}
          aria-label="Go to Rewards Store"
        >
          <span className="material-symbols-outlined">redeem</span>
          <span className={styles.label}>Rewards</span>
        </Link>

        <Link
          to="/leaderboard"
          className={`${styles.navItem} ${isLeaderboard ? styles.active : ''}`}
          aria-label="Go to Leaderboard"
        >
          <span className="material-symbols-outlined">leaderboard</span>
          <span className={styles.label}>Ranking</span>
        </Link>
      </div>
    </nav>
  );
}
