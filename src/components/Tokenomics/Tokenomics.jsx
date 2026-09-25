import { Link } from 'react-router-dom';
import styles from './Tokenomics.module.css';

export default function Tokenomics() {
  return (
    <section className={styles.section} aria-label="Tokenomics breakdown">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>TOKENOMICS</span>
          <h2 className={styles.title}>How VELoop Tokens Work</h2>
          <p className={styles.subtitle}>
            A dual-asset gaming infrastructure engineered for transparent fair play and
            immediate digital reward accrual.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className={styles.cardsGrid}>
          {/* Step 1 */}
          <div className={styles.card}>
            <div className={`${styles.stepBadge} ${styles.stepBadge1}`}>1</div>
            <div className={styles.cardHeader}>
              <img
                src="/assets/images/token.jpeg"
                alt=""
                className={styles.cardIcon}
                style={{ mixBlendMode: 'screen' }}
              />
              <h3 className={styles.cardTitle}>Use Tokens to Enter</h3>
            </div>
            <p className={styles.cardDesc}>
              Every game round costs 20 Tokens. Tokens unlock ranked leaderboards,
              challenge tiers, and seasonal tournaments.
            </p>
          </div>

          {/* Step 2 */}
          <div className={styles.card}>
            <div className={`${styles.stepBadge} ${styles.stepBadge2}`}>2</div>
            <div className={styles.cardHeader}>
              <img
                src="/assets/images/game-coin.jpeg"
                alt=""
                className={styles.cardIcon}
                style={{ mixBlendMode: 'screen' }}
              />
              <h3 className={styles.cardTitle}>Win Game Coins</h3>
            </div>
            <p className={styles.cardDesc}>
              Score multipliers and podium finishes award Game Coins into your
              verified vault. Earn bonus coins via daily challenge streaks.
            </p>
          </div>

          {/* Step 3 */}
          <div className={styles.card}>
            <div className={`${styles.stepBadge} ${styles.stepBadge3}`}>3</div>
            <div className={styles.cardHeader}>
              <span
                className="material-symbols-outlined"
                style={{ color: '#38bdf8', fontSize: 22, flexShrink: 0 }}
              >
                redeem
              </span>
              <h3 className={styles.cardTitle}>Redeem Luxury Perks</h3>
            </div>
            <p className={styles.cardDesc}>
              Liquidate Game Coins directly for high-tier rewards, ecosystem vouchers,
              hardware, and VIP status privileges.
            </p>
          </div>
        </div>
      </div>

      {/* Footer from screenshot */}
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerLeft}>
          <span className={styles.footerBrand}>VELoop</span>
          <span className={styles.footerCopy}>
            &copy; 2025 VELoop Rewards Ecosystem. All rights reserved.
          </span>
        </div>

        <div className={styles.footerLinks}>
          <Link to="/rewards" className={styles.footerLink}>
            Privacy Policy
          </Link>
          <Link to="/rewards" className={styles.footerLink}>
            Terms of Service
          </Link>
          <Link to="/rewards" className={styles.footerLink}>
            Vault Security
          </Link>
          <Link to="/profile" className={styles.footerLink}>
            Help Center
          </Link>
        </div>
      </footer>
    </section>
  );
}
