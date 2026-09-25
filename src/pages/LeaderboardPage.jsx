import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import styles from './LeaderboardPage.module.css';

export default function LeaderboardPage() {
  const { sessionResults } = useGame();
  const [selectedGame, setSelectedGame] = useState('all');
  const [timeFilter, setTimeFilter] = useState('weekly');

  // Realistic leaderboard mock data
  const basePlayers = [
    { rank: 1, name: 'ShadowBlade', avatar: '🥷', vip: 'VIP 6', game: 'Blade Master!', score: 14850, streak: '24x', prize: '+5,000 Coins' },
    { rank: 2, name: 'NeonStriker', avatar: '⚡', vip: 'VIP 5', game: 'Block Crush', score: 12400, streak: '18x', prize: '+3,500 Coins' },
    { rank: 3, name: 'VortexMaster', avatar: '🌀', vip: 'VIP 5', game: 'Blade Master!', score: 11190, streak: '15x', prize: '+2,000 Coins' },
    { rank: 4, name: 'CyberSamurai', avatar: '🗡️', vip: 'VIP 4', game: 'Blade Master!', score: 9800, streak: '12x', prize: '+1,000 Coins' },
    { rank: 5, name: 'PixelCrusher', avatar: '🕹️', vip: 'VIP 4', game: 'Block Crush', score: 8640, streak: '10x', prize: '+800 Coins' },
    { rank: 6, name: 'AeroAce', avatar: '🚀', vip: 'VIP 3', game: 'Cosmo Warrior', score: 7920, streak: '8x', prize: '+600 Coins' },
    { rank: 7, name: 'NovaQueen', avatar: '👑', vip: 'VIP 3', game: 'Block Crush', score: 7150, streak: '7x', prize: '+500 Coins' },
    { rank: 8, name: 'Zenith', avatar: '🎯', vip: 'VIP 2', game: 'Blade Master!', score: 6540, streak: '6x', prize: '+400 Coins' },
    { rank: 9, name: 'RogueHunter', avatar: '🏹', vip: 'VIP 2', game: 'Realm Clash!', score: 5800, streak: '5x', prize: '+300 Coins' },
    { rank: 10, name: 'EchoDrifter', avatar: '🌊', vip: 'VIP 1', game: 'Aqua Fill!', score: 4950, streak: '4x', prize: '+200 Coins' },
  ];

  // Include user's recent score if available
  const userBestScore = useMemo(() => {
    if (!sessionResults || sessionResults.length === 0) return 3420;
    return Math.max(...sessionResults.map((r) => r.score || 0), 3420);
  }, [sessionResults]);

  const filteredPlayers = useMemo(() => {
    if (selectedGame === 'all') return basePlayers;
    if (selectedGame === 'blade-master') {
      return basePlayers.filter((p) => p.game === 'Blade Master!');
    }
    if (selectedGame === 'block-crush') {
      return basePlayers.filter((p) => p.game === 'Block Crush');
    }
    return basePlayers;
  }, [selectedGame]);

  const top3 = filteredPlayers.slice(0, 3);
  const remaining = filteredPlayers.slice(3);

  return (
    <div className={styles.page}>
      {/* Hero & Tournament Banner */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.pillTag}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>military_tech</span>
          Competitive Leaderboards
        </div>
        <h1 className={styles.title}>Arcade Hall of Fame</h1>
        <p className={styles.subtitle}>
          Compete across Blade Master and Block Crush, climb the global rankings, and win weekly Game Coin prize pools and exclusive VIP badges.
        </p>

        {/* Live Season Tournament Card */}
        <div className={styles.tournamentBanner}>
          <div className={styles.tourneyLeft}>
            <div className={styles.tourneyIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>trophy</span>
            </div>
            <div>
              <div className={styles.tourneyTitle}>Tournament Season 3: Reflex Clash</div>
              <div className={styles.tourneySubtitle}>Ends in 2 days, 14 hours • Live Ranking Active</div>
            </div>
          </div>
          <div className={styles.tourneyPool}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>monetization_on</span>
            50,000 Coin Prize Pool
          </div>
        </div>
      </section>

      {/* Tabs & Time Filters */}
      <div className={styles.filterBar}>
        <div className={styles.tabs} role="tablist" aria-label="Game Filter">
          <button
            type="button"
            className={`${styles.tab} ${selectedGame === 'all' ? styles.tabActive : ''}`}
            onClick={() => setSelectedGame('all')}
          >
            All Games
          </button>
          <button
            type="button"
            className={`${styles.tab} ${selectedGame === 'blade-master' ? styles.tabActive : ''}`}
            onClick={() => setSelectedGame('blade-master')}
          >
            Blade Master!
          </button>
          <button
            type="button"
            className={`${styles.tab} ${selectedGame === 'block-crush' ? styles.tabActive : ''}`}
            onClick={() => setSelectedGame('block-crush')}
          >
            Block Crush
          </button>
        </div>

        <div className={styles.timePills} role="group" aria-label="Timeframe Filter">
          {['daily', 'weekly', 'all-time'].map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.timePill} ${timeFilter === t ? styles.timePillActive : ''}`}
              onClick={() => setTimeFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className={styles.podiumGrid}>
          {/* #2 Silver */}
          <div className={`${styles.podiumCard} ${styles.podium2}`}>
            <div className={`${styles.rankBadge} ${styles.silverBadge}`}>2</div>
            <div className={styles.avatar}>{top3[1].avatar}</div>
            <h3 className={styles.playerName}>{top3[1].name}</h3>
            <span className={styles.tierTag}>{top3[1].vip}</span>
            <div className={styles.podiumScore}>{top3[1].score.toLocaleString()} PTS</div>
            <div className={styles.podiumPrize}>{top3[1].prize}</div>
          </div>

          {/* #1 Gold */}
          <div className={`${styles.podiumCard} ${styles.podium1}`}>
            <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: 28, marginBottom: 4 }}>
              crown
            </span>
            <div className={`${styles.rankBadge} ${styles.goldBadge}`}>1</div>
            <div className={styles.avatar} style={{ borderColor: '#fbbf24' }}>{top3[0].avatar}</div>
            <h3 className={styles.playerName}>{top3[0].name}</h3>
            <span className={styles.tierTag} style={{ color: '#fbbf24' }}>{top3[0].vip}</span>
            <div className={styles.podiumScore} style={{ fontSize: '1.5rem' }}>{top3[0].score.toLocaleString()} PTS</div>
            <div className={styles.podiumPrize} style={{ color: '#34d399', fontWeight: 700 }}>{top3[0].prize}</div>
          </div>

          {/* #3 Bronze */}
          <div className={`${styles.podiumCard} ${styles.podium3}`}>
            <div className={`${styles.rankBadge} ${styles.bronzeBadge}`}>3</div>
            <div className={styles.avatar}>{top3[2].avatar}</div>
            <h3 className={styles.playerName}>{top3[2].name}</h3>
            <span className={styles.tierTag}>{top3[2].vip}</span>
            <div className={styles.podiumScore}>{top3[2].score.toLocaleString()} PTS</div>
            <div className={styles.podiumPrize}>{top3[2].prize}</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Challenger</th>
              <th className={styles.th}>Game</th>
              <th className={styles.th}>Score</th>
              <th className={styles.th}>Streak</th>
              <th className={styles.th}>Weekly Payout</th>
            </tr>
          </thead>
          <tbody>
            {remaining.map((p) => (
              <tr key={p.rank} className={styles.tableRow}>
                <td className={styles.td} style={{ fontWeight: 700, color: '#94a3b8' }}>
                  #{p.rank}
                </td>
                <td className={styles.td}>
                  <div className={styles.playerCell}>
                    <div className={styles.miniAvatar}>{p.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#60a5fa' }}>{p.vip}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>{p.game}</td>
                <td className={styles.td} style={{ fontWeight: 700, color: '#ffb95f' }}>
                  {p.score.toLocaleString()} PTS
                </td>
                <td className={styles.td} style={{ color: '#cbd5e1' }}>
                  {p.streak}
                </td>
                <td className={styles.td} style={{ color: '#34d399', fontWeight: 600 }}>
                  {p.prize}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Current Position Bar */}
      <div className={styles.userStatusBar}>
        <div className={styles.userStatusLeft}>
          <div className={styles.userRankBadge}>#14</div>
          <div className={styles.userStatusInfo}>
            <div className={styles.userStatusName}>Your Standing • Alex M. (VIP Level 4)</div>
            <div className={styles.userStatusScore}>
              Personal Best: <strong style={{ color: '#ffb95f' }}>{userBestScore.toLocaleString()} PTS</strong> • Current Reward Tier: <strong style={{ color: '#34d399' }}>+350 Coins</strong>
            </div>
          </div>
        </div>

        <Link to="/games/blade-master/play" className={styles.climbBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
          Play &amp; Climb Leaderboard
        </Link>
      </div>
    </div>
  );
}
