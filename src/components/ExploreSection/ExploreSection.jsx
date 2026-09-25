import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useGame } from '../../context/GameContext';
import styles from './ExploreSection.module.css';

export default function ExploreSection() {
  const { addCoins, addTokens } = useGame();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyPlayable, setOnlyPlayable] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [claimedQuests, setClaimedQuests] = useState({});
  const [questNotice, setQuestNotice] = useState('');

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set(GAMES.map((g) => g.genre));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter and sort games
  const filteredGames = useMemo(() => {
    return GAMES.filter((game) => {
      const matchSearch =
        game.name.toLowerCase().includes(search.toLowerCase()) ||
        game.genre.toLowerCase().includes(search.toLowerCase()) ||
        game.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' || game.genre === selectedCategory;

      const matchPlayable = !onlyPlayable || game.playable;

      return matchSearch && matchCategory && matchPlayable;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reward') return (b.coinReward || 0) - (a.coinReward || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [search, selectedCategory, onlyPlayable, sortBy]);

  // Handle claiming quests
  const handleClaimQuest = (questId, coins, tokens, title) => {
    if (claimedQuests[questId]) return;
    if (coins > 0) addCoins(coins);
    if (tokens > 0) addTokens(tokens);

    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
    setQuestNotice(`Claimed: ${title}! Added ${coins ? `+${coins} Coins` : ''} ${tokens ? `+${tokens} Tokens` : ''}`);
    setTimeout(() => setQuestNotice(''), 3000);
  };

  const quests = [
    { id: 'q1', title: 'Daily Explorer', desc: 'Browse the games catalog', rewardCoins: 100, rewardTokens: 0 },
    { id: 'q2', title: 'Sharpshooter Challenge', desc: 'Test your reflexes in Blade Master', rewardCoins: 150, rewardTokens: 10 },
    { id: 'q3', title: 'Prismatic Breaker', desc: 'Shatter numbered neon bricks in Block Crush', rewardCoins: 200, rewardTokens: 15 },
  ];

  return (
    <section className={styles.section} id="explore" aria-label="Explore Games and Quests">
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.pillTag}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>explore</span>
          Arcade Discovery Hub
        </div>
        <h2 className={styles.title}>Explore Games &amp; Quests</h2>
        <p className={styles.subtitle}>
          Discover all 13 titles in the VELoop ecosystem, take on interactive daily quests to earn free Coins and Tokens, and launch directly into browser arcade gameplay.
        </p>

        {/* Quests section */}
        <div className={styles.questsBox}>
          <div className={styles.questsTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>task_alt</span>
            Daily Quests &amp; Free Token Drops
            {questNotice && (
              <span style={{ color: '#34d399', fontSize: 12, marginLeft: 'auto', fontWeight: 600 }}>
                {questNotice}
              </span>
            )}
          </div>
          <div className={styles.questsGrid}>
            {quests.map((q) => {
              const isClaimed = !!claimedQuests[q.id];
              return (
                <div key={q.id} className={styles.questCard}>
                  <div className={styles.questInfo}>
                    <div className={styles.questName}>{q.title}</div>
                    <div className={styles.questReward}>
                      {q.rewardCoins > 0 && <span>+{q.rewardCoins} Coins</span>}
                      {q.rewardTokens > 0 && <span>• +{q.rewardTokens} Tokens</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.claimBtn}
                    onClick={() => handleClaimQuest(q.id, q.rewardCoins, q.rewardTokens, q.title)}
                    disabled={isClaimed}
                  >
                    {isClaimed ? 'Claimed' : 'Claim'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrap}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by game name or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search games"
          />
        </div>

        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.playableToggle} ${onlyPlayable ? styles.playableToggleActive : ''}`}
            onClick={() => setOnlyPlayable(!onlyPlayable)}
            aria-pressed={onlyPlayable}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {onlyPlayable ? 'check_box' : 'check_box_outline_blank'}
            </span>
            Playable Games Only
          </button>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort games"
          >
            <option value="rating">Sort by: Top Rated</option>
            <option value="reward">Sort by: Highest Reward</option>
            <option value="name">Sort by: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className={styles.categoryPills} role="tablist" aria-label="Game categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`${styles.categoryPill} ${selectedCategory === cat ? styles.categoryPillActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
            role="tab"
            aria-selected={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className={styles.noResults}>
          <span className={`material-symbols-outlined ${styles.noResultsIcon}`}>search_off</span>
          <h3>No games found</h3>
          <p>Try adjusting your search query or removing the active filters.</p>
        </div>
      ) : (
        <div className={styles.gamesGrid}>
          {filteredGames.map((game) => (
            <article key={game.id} className={styles.gameCard}>
              <Link to={`/games/${game.id}`} className={styles.artWrap} aria-label={`View ${game.name}`}>
                <img src={game.banner} alt={game.name} className={styles.art} loading="lazy" />
                <div className={styles.artOverlay} aria-hidden="true" />
                <span className={styles.badge}>{game.genre}</span>
                {game.playable && (
                  <span className={styles.playableBadge}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>play_arrow</span>
                    Playable
                  </span>
                )}
              </Link>

              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{game.name}</h3>
                  <div className={styles.cardRating}>
                    <span className="material-symbols-outlined icon-fill" style={{ fontSize: 14 }}>star</span>
                    {game.rating}
                  </div>
                </div>

                <p className={styles.cardTagline}>{game.tagline}</p>

                <div className={styles.cardMeta}>
                  <span className={styles.metaItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#60a5fa' }}>groups</span>
                    {game.players} players
                  </span>
                  <span className={styles.metaItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#34d399' }}>payments</span>
                    Est. +{game.coinReward} Coins
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardCost}>
                  <img src="/assets/images/token.jpeg" alt="Token" />
                  <span>20 Tokens</span>
                </div>

                <Link
                  to={game.playable ? `/games/${game.id}/play` : `/games/${game.id}`}
                  className={`${styles.cardBtn} ${game.playable ? styles.cardBtnPrimary : ''}`}
                >
                  {game.playable ? 'Play Now' : 'Game Guide'}
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
