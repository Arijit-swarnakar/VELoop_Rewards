import styles from './CarouselDots.module.css';

export default function CarouselDots({ count, active, onSelect, games }) {
  // Show max 13 dots; for larger carousels consider grouping
  return (
    <div className={styles.dots} role="tablist" aria-label="Select game card">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={games?.[i]?.name ?? `Card ${i + 1}`}
          className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
