import styles from './TokenCost.module.css';

export default function TokenCost({ amount = 20, size = 'md' }) {
  return (
    <div className={`${styles.tokenCost} ${styles[size]}`} aria-label={`Cost: ${amount} Tokens`}>
      <img
        src="/assets/images/token.jpeg"
        alt="Token"
        className={styles.tokenIcon}
      />
      <span className={styles.costText}>{amount} Tokens</span>
    </div>
  );
}
