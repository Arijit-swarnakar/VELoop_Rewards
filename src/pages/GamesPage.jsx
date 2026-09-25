import { useEffect } from 'react';
import { GAMES } from '../data/games';
import GamesCarousel from '../components/GamesCarousel/GamesCarousel';
import Tokenomics from '../components/Tokenomics/Tokenomics';
import styles from './GamesPage.module.css';

export default function GamesPage() {
  useEffect(() => {
    document.body.classList.add(styles.body);
    return () => document.body.classList.remove(styles.body);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Games</h1>
        <p className={styles.subtitle}>
          {GAMES.length} games available &mdash; 20 Tokens each
        </p>
      </div>

      <GamesCarousel games={GAMES} />

      <Tokenomics />
    </div>
  );
}