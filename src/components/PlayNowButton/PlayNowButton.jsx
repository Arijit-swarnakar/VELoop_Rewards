import { Link } from 'react-router-dom';
import styles from './PlayNowButton.module.css';

export default function PlayNowButton({
  to,
  onClick,
  disabled = false,
  children = 'Play Now',
  size = 'md',
  className = '',
  ariaLabel
}) {
  const content = (
    <>
      <span className={styles.btnInner}>
        <span>{children}</span>
        <span className={`material-symbols-outlined ${styles.arrowIcon}`}>arrow_forward</span>
      </span>
      <span className={styles.shimmer} aria-hidden="true" />
    </>
  );

  if (to && !disabled) {
    return (
      <Link
        to={to}
        className={`${styles.button} ${styles[size]} ${className}`}
        aria-label={ariaLabel || (typeof children === 'string' ? children : 'Play Now')}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[size]} ${className}`}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Play Now')}
    >
      {content}
    </button>
  );
}
