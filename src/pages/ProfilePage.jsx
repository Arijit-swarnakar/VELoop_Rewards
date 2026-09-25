import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import AuthModal from '../components/AuthModal/AuthModal';
import styles from './ProfilePage.module.css';

const AVATAR_LIST = [
  { id: 'sports_esports', label: 'Arcade Master' },
  { id: 'swords', label: 'Blade Warrior' },
  { id: 'smart_toy', label: 'Cyber Bot' },
  { id: 'shield', label: 'Guardian' },
  { id: 'bolt', label: 'Speedster' },
  { id: 'psychology', label: 'Tactician' },
  { id: 'military_tech', label: 'Champion' },
  { id: 'rocket_launch', label: 'Cosmic Ace' },
];

const GRADIENT_PALETTE = [
  { id: 'blue', value: 'linear-gradient(135deg, #2563eb, #38bdf8)' },
  { id: 'violet', value: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { id: 'emerald', value: 'linear-gradient(135deg, #059669, #34d399)' },
  { id: 'amber', value: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { id: 'crimson', value: 'linear-gradient(135deg, #dc2626, #f87171)' },
];

export default function ProfilePage() {
  const {
    user,
    tokenBalance,
    coinBalance,
    sessionResults,
    redemptionHistory,
    addTokens,
    addCoins,
    updateProfile,
    logout,
    login,
  } = useGame();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [editName, setEditName] = useState(user?.name || 'Alex Morgan');
  const [editUsername, setEditUsername] = useState(user?.username || 'alex_veloop');
  const [editEmail, setEditEmail] = useState(user?.email || 'alex.morgan@veloop.io');
  const [editCountry, setEditCountry] = useState(user?.country || 'United States');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || 'sports_esports');
  const [editGradient, setEditGradient] = useState(
    user?.avatarGradient || 'linear-gradient(135deg, #2563eb, #38bdf8)'
  );

  // Activity Tab state
  const [historyTab, setHistoryTab] = useState('games'); // 'games' | 'redemptions'

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState('');

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  // Sync edit form with user state when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
      setEditCountry(user.country || 'United States');
      setEditBio(user.bio || '');
      setEditAvatar(user.avatar || 'sports_esports');
      setEditGradient(user.avatarGradient || 'linear-gradient(135deg, #2563eb, #38bdf8)');
    }
  }, [user]);

  // Open edit mode if ?edit=true query param arrives
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Please provide a display name');
      return;
    }
    updateProfile({
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim(),
      country: editCountry.trim(),
      bio: editBio.trim(),
      avatar: editAvatar,
      avatarGradient: editGradient,
    });
    setIsEditing(false);
    searchParams.delete('edit');
    setSearchParams(searchParams);
    showToast('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    searchParams.delete('edit');
    setSearchParams(searchParams);
    if (user) {
      setEditName(user.name);
      setEditUsername(user.username);
      setEditEmail(user.email);
      setEditCountry(user.country);
      setEditBio(user.bio);
      setEditAvatar(user.avatar);
      setEditGradient(user.avatarGradient);
    }
  };

  const handleTogglePreference = (key) => {
    const newVal = !user[key];
    updateProfile({ [key]: newVal });
    showToast(`${key === 'soundEnabled' ? 'Sound FX' : 'Match notifications'} ${newVal ? 'enabled' : 'disabled'}`);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // If user is guest/logged out
  if (!user?.isLoggedIn) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.backLink}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Back to Games
          </Link>
          <div className={styles.pageTitleGroup}>
            <h1 className={styles.pageTitle}>Player Profile</h1>
            <span className={styles.badgeGamer}>GUEST MODE</span>
          </div>
        </div>

        <div className={styles.guestBanner}>
          <div className={styles.guestIcon}>
            <span className="material-symbols-outlined">person_off</span>
          </div>
          <h2 className={styles.guestTitle}>Sign In to Access Your Dashboard</h2>
          <p className={styles.guestDesc}>
            Create your custom gamer identity, save your high scores, track match earnings,
            level up through VIP tiers, and unlock exclusive rewards!
          </p>
          <div className={styles.guestActions}>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => openAuth('signin')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
              Sign In to Account
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={() => openAuth('signup')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
              Create Free Account (+50 Tokens)
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                login({
                  name: 'Alex Morgan',
                  username: 'alex_veloop',
                  email: 'alex.morgan@veloop.io',
                  avatar: 'sports_esports',
                });
                showToast('Signed in as Alex Morgan (VIP Level 4)!');
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
              Demo VIP Login
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  // Calculate Win Rate
  const matches = user.stats?.matchesPlayed || 0;
  const won = user.stats?.gamesWon || 0;
  const winRate = matches > 0 ? Math.round((won / matches) * 100) : 74;
  const xpPercent = Math.min(100, Math.round(((user.xp || 7450) / (user.xpNext || 10000)) * 100));

  return (
    <div className={styles.profilePage}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Arcade Games
        </Link>
        <div className={styles.pageTitleGroup}>
          <h1 className={styles.pageTitle}>Player Dashboard</h1>
          <span className={styles.badgeGamer}>VERIFIED GAMER</span>
        </div>
      </div>

      {/* Success Notification Toast */}
      {toastMsg && (
        <div className={styles.toastSuccess}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg('')}
            style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroGlow} />

        <div className={styles.heroMain}>
          <div className={styles.heroLeft}>
            <div className={styles.avatarWrap}>
              <div
                className={styles.avatarLarge}
                style={{ background: user.avatarGradient || 'linear-gradient(135deg, #2563eb, #38bdf8)' }}
              >
                <span className="material-symbols-outlined">{user.avatar || 'sports_esports'}</span>
              </div>
              <div className={styles.vipBadgeFloater} title={`VIP Level ${user.vipLevel}`}>
                {user.vipLevel}
              </div>
            </div>

            <div className={styles.heroDetails}>
              <div className={styles.heroNameRow}>
                <h2 className={styles.heroName}>{user.name}</h2>
                <span className={styles.tierPill}>
                  VIP Level {user.vipLevel} • {user.vipTier}
                </span>
              </div>

              <div className={styles.heroTagRow}>
                <span className={styles.heroTag}>@{user.username}</span>
                <span className={styles.heroMeta}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>public</span>
                  {user.country || 'Global'}
                </span>
                <span className={styles.heroMeta}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                  Member since {user.joinedDate || 'Nov 2024'}
                </span>
              </div>

              <p className={styles.heroBio}>
                {user.bio || 'Arcade champion & high-score hunter. Competing across Blade Master and Block Crush tournaments!'}
              </p>
            </div>
          </div>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => setIsEditing(!isEditing)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isEditing ? 'close' : 'edit'}
              </span>
              {isEditing ? 'Close Edit' : 'Update Profile'}
            </button>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => {
                logout();
                showToast('Logged out of player account.');
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
              Log Out
            </button>
          </div>
        </div>

        {/* Inline Edit Profile Panel */}
        {isEditing && (
          <form className={styles.editPanel} onSubmit={handleSaveProfile}>
            <div className={styles.editPanelHeader}>
              <h3 className={styles.editPanelTitle}>
                <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>manage_accounts</span>
                Edit Profile Details
              </h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Update your gamer identity and avatar</span>
            </div>

            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Display Name</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Gamer Tag / Username</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="e.g. alex_veloop"
                  required
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.editInput}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. alex@veloop.io"
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.editLabel}>Country / Region</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  placeholder="e.g. United States"
                />
              </div>

              <div className={styles.editFieldFull}>
                <label className={styles.editLabel}>Player Bio</label>
                <textarea
                  className={styles.editTextarea}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write a short gamer bio or motto..."
                />
              </div>

              {/* Avatar Icon Picker */}
              <div className={styles.editFieldFull}>
                <label className={styles.editLabel}>Select Avatar Icon</label>
                <div className={styles.avatarPickerRow}>
                  {AVATAR_LIST.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`${styles.avatarPickBtn} ${editAvatar === av.id ? styles.avatarPickBtnSelected : ''}`}
                      style={{ background: editGradient }}
                      onClick={() => setEditAvatar(av.id)}
                      title={av.label}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        {av.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Color Palette */}
              <div className={styles.editFieldFull}>
                <label className={styles.editLabel}>Avatar Theme Color</label>
                <div className={styles.gradientPickRow}>
                  {GRADIENT_PALETTE.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      className={`${styles.gradientPickBtn} ${editGradient === pal.value ? styles.gradientPickBtnSelected : ''}`}
                      style={{ background: pal.value }}
                      onClick={() => setEditGradient(pal.value)}
                      title={pal.id}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.editActions}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancelEdit}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Performance Matrix Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <span className="material-symbols-outlined">sports_esports</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{matches}</div>
            <div className={styles.statLabel}>Matches Played</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{winRate}%</div>
            <div className={styles.statLabel}>Match Win Rate</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <span className="material-symbols-outlined">military_tech</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{(user.stats?.highestScore || 18450).toLocaleString()}</div>
            <div className={styles.statLabel}>High Score</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
            <span className="material-symbols-outlined">emoji_events</span>
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{user.stats?.tournamentsWon || 5}</div>
            <div className={styles.statLabel}>Tournaments Won</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: VIP Progression + Economy Wallet */}
      <div className={styles.twoColLayout}>
        {/* Left Column: VIP Loyalty & Active Perks */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>workspace_premium</span>
              VIP Tier Progression &amp; Perks
            </h3>
            <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>VIP 4 GOLD</span>
          </div>

          <div className={styles.vipProgressBox}>
            <div className={styles.vipProgressTop}>
              <div className={styles.vipLevelTag}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>military_tech</span>
                Level {user.vipLevel} &rarr; Level {user.vipLevel + 1}
              </div>
              <div className={styles.vipXpCount}>
                {(user.xp || 7450).toLocaleString()} / {(user.xpNext || 10000).toLocaleString()} XP ({xpPercent}%)
              </div>
            </div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <div className={styles.vipPerksList}>
            <div className={styles.perkItem}>
              <span className={`material-symbols-outlined ${styles.perkIcon}`}>percent</span>
              <div className={styles.perkText}>
                <strong>+15% Coin Multiplier</strong>
                <div>Bonus Game Coins awarded on every tournament match victory.</div>
              </div>
            </div>

            <div className={styles.perkItem}>
              <span className={`material-symbols-outlined ${styles.perkIcon}`}>casino</span>
              <div className={styles.perkText}>
                <strong>Daily Wheel Bonus</strong>
                <div>+1 extra free spin on the Lucky Wheel in the Rewards Hub daily.</div>
              </div>
            </div>

            <div className={styles.perkItem}>
              <span className={`material-symbols-outlined ${styles.perkIcon}`}>shield</span>
              <div className={styles.perkText}>
                <strong>Golden Leaderboard Frame</strong>
                <div>Exclusive illuminated profile halo shown on tournament podiums.</div>
              </div>
            </div>

            <div className={styles.perkItem}>
              <span className={`material-symbols-outlined ${styles.perkIcon}`}>bolt</span>
              <div className={styles.perkText}>
                <strong>Priority Token Refills</strong>
                <div>Instant demo boosts with enhanced token reserve limits.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet & Quick Actions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>account_balance_wallet</span>
              Economy &amp; Balances
            </h3>
            <Link to="/rewards" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              Rewards Store &rarr;
            </Link>
          </div>

          <div className={styles.walletBalances}>
            <div className={styles.walletBalRow}>
              <div className={styles.walletBalLeft}>
                <img src="/assets/images/game-coin.jpeg" alt="Game Coins" style={{ mixBlendMode: 'screen' }} />
                <div>
                  <div className={styles.walletBalNum}>{coinBalance.toLocaleString()}</div>
                  <div className={styles.walletBalLabel}>Game Coins</div>
                </div>
              </div>
              <Link to="/rewards" className={styles.saveBtn} style={{ padding: '6px 14px', fontSize: 12 }}>
                Redeem
              </Link>
            </div>

            <div className={styles.walletBalRow}>
              <div className={styles.walletBalLeft}>
                <img src="/assets/images/token.jpeg" alt="Match Tokens" style={{ mixBlendMode: 'screen' }} />
                <div>
                  <div className={styles.walletBalNum}>{tokenBalance}</div>
                  <div className={styles.walletBalLabel}>Match Tokens</div>
                </div>
              </div>
              <button
                type="button"
                className={styles.editBtn}
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={() => {
                  addTokens(50);
                  showToast('+50 Match Tokens added to wallet!');
                }}
              >
                +50 Boost
              </button>
            </div>
          </div>

          <div className={styles.walletActions}>
            <button
              type="button"
              className={styles.walletActionBtn}
              onClick={() => {
                addCoins(500);
                showToast('+500 Game Coins added to wallet!');
              }}
            >
              <span>Quick Refill +500 Coins</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fbbf24' }}>paid</span>
            </button>
            <Link to="/rewards" className={styles.walletActionBtn}>
              <span>Exchange for VE, SVE &amp; Gems</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_horiz</span>
            </Link>
            <Link to="/leaderboard" className={styles.walletActionBtn}>
              <span>View Tournament Prizes</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>military_tech</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Account Preferences / Settings */}
      <div className={styles.settingsGrid}>
        <div className={styles.settingCard}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>Sound Effects &amp; Audio</div>
            <div className={styles.settingDesc}>Play audio synth cues in games</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={user.soundEnabled !== false}
              onChange={() => handleTogglePreference('soundEnabled')}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.settingCard}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>Match Notifications</div>
            <div className={styles.settingDesc}>Alerts for tournament rank updates</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={user.notificationsEnabled !== false}
              onChange={() => handleTogglePreference('notificationsEnabled')}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.settingCard}>
          <div className={styles.settingInfo}>
            <div className={styles.settingTitle}>High Roller Confirmation</div>
            <div className={styles.settingDesc}>Prompt before 20+ Token entries</div>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={user.highRollerConfirm !== false}
              onChange={() => handleTogglePreference('highRollerConfirm')}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>

      {/* Activity History Tabs */}
      <div className={styles.historyCard}>
        <div className={styles.sectionHeader} style={{ marginBottom: 12 }}>
          <div className={styles.historyTabs}>
            <button
              type="button"
              className={`${styles.historyTabBtn} ${historyTab === 'games' ? styles.historyTabActive : ''}`}
              onClick={() => setHistoryTab('games')}
            >
              Recent Matches ({sessionResults.length})
            </button>
            <button
              type="button"
              className={`${styles.historyTabBtn} ${historyTab === 'redemptions' ? styles.historyTabActive : ''}`}
              onClick={() => setHistoryTab('redemptions')}
            >
              Redemptions ({redemptionHistory.length})
            </button>
          </div>
          <Link to="/" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
            Play Matches &rarr;
          </Link>
        </div>

        {historyTab === 'games' ? (
          <div className={styles.historyList}>
            {sessionResults.length === 0 ? (
              <div className={styles.emptyHistory}>
                No matches played yet in this session. Start a game to record your score!
              </div>
            ) : (
              sessionResults.map((item, idx) => (
                <div key={item.id || idx} className={styles.historyItem}>
                  <div className={styles.historyItemLeft}>
                    <div className={styles.historyIconWrap}>
                      <span className="material-symbols-outlined">sports_esports</span>
                    </div>
                    <div>
                      <div className={styles.historyTitle}>{item.gameName || 'Arcade Match'}</div>
                      <div className={styles.historyTime}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.historyItemRight}>
                    <div className={styles.historyReward}>+{item.coinsEarned || 200} Coins</div>
                    <div className={styles.historyScore}>Score: {item.score?.toLocaleString() || 0} pts</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className={styles.historyList}>
            {redemptionHistory.length === 0 ? (
              <div className={styles.emptyHistory}>
                No rewards redeemed yet. Visit the Rewards Store to exchange Game Coins!
              </div>
            ) : (
              redemptionHistory.map((item, idx) => (
                <div key={item.id || idx} className={styles.historyItem}>
                  <div className={styles.historyItemLeft}>
                    <div className={styles.historyIconWrap} style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                      <span className="material-symbols-outlined">redeem</span>
                    </div>
                    <div>
                      <div className={styles.historyTitle}>{item.label || item.category}</div>
                      <div className={styles.historyTime}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.historyItemRight}>
                    <div className={styles.historyReward} style={{ color: '#ef4444' }}>
                      -{item.coinsSpent?.toLocaleString()} Coins
                    </div>
                    <div className={styles.historyScore}>+{item.unitsReceived} {item.category}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
