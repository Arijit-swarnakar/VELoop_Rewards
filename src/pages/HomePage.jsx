import { useEffect } from 'react';
import ExploreSection from '../components/ExploreSection/ExploreSection';
import styles from './HomePage.module.css';

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <ExploreSection />
    </div>
  );
}
