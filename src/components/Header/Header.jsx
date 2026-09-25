import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import AuthModal from '../AuthModal/AuthModal';
import styles from './Header.module.css';

export default function Header() {
  const {
    tokenBalance,
    coinBalance,
    addTokens,
    addCoins,
    resetDemo,
    user,
    login,
    logout,
  } = useGame();

  const location = useLocation();
  const navigate = useNavigate();

  // Dropdown states
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      icon: 'military_tech',
      title: 'Tournament Rank Climb',
      desc: 'You reached Rank #14 in Blade Master! Current prize tier: +350 Coins.',
      time: '10m ago',
      link: '/leaderboard',
      unread: true,
      color: '#fbbf24',
    },
    {
      id: 'n2',
      icon: 'redeem',
      title: 'Daily Streak Bonus Ready',
      desc: 'Day 4 streak reward (+25 Tokens & +100 Coins) is waiting in the Rewards Hub.',
      time: '1h ago',
      link: '/rewards',
      unread: true,
      color: '#34d399',
    },
    {
      id: 'n3',
      icon: 'casino',
      title: 'Lucky Wheel Active',
      desc: 'Free spin available! Win up to 1,000 Coins or 50 Tokens.',
      time: '3h ago',
      link: '/rewards',
      unread: true,
      color: '#a855f7',
    },
    {
      id: 'n4',
      icon: 'sports_esports',
      title: 'Arcade Match Live',
      desc: 'Blade Master and Block Crush are ready for live 20-token challenges.',
      time: 'Yesterday',
      link: '/',
      unread: false,
      color: '#60a5fa',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const isHome = location.pathname === '/' || location.pathname === '/explore';
  const isGames = location.pathname.startsWith('/games');
  const isRewards = location.pathname === '/rewards' || location.pathname === '/redeem';
  const isLeaderboard = location.pathname === '/leaderboard';
  const isProfile = location.pathname === '/profile';

  const closeAll = () => {
    setShowNotifs(false);
    setShowProfile(false);
    setShowMobileMenu(false);
  };

  const handleGoHome = () => {
    closeAll();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const toggleNotifs = () => {
    setShowProfile(false);
    setShowMobileMenu(false);
    setShowNotifs((prev) => !prev);
  };

  const toggleProfile = () => {
    setShowNotifs(false);
    setShowMobileMenu(false);
    setShowProfile((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setShowNotifs(false);
    setShowProfile(false);
    setShowMobileMenu((prev) => !prev);
  };

  const openAuth = (mode = 'signin') => {
    closeAll();
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearNotifs = () => {
    setNotifications([]);
  };

  const handleNotifClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    closeAll();
    navigate(item.link);
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        {/* Logo - clicking VELoop Games navigates to Home */}
        <div className={styles.logoGroup}>
          <Link
            to="/"
            className={styles.logoLink}
            onClick={handleGoHome}
            aria-label="VELoop Games Home"
          >
            <div className={styles.logoIcon} aria-hidden="true">
              <img
                src="/assets/images/veloop-logo.jpg"
                alt="VELoop Games Logo"
                className={styles.logoImg}
              />
            </div>
            <span className={styles.logoName}>VELoop</span>
            <span className={styles.logoBadge}>GAMES</span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            <Link
              to="/"
              className={`${styles.navLink} ${isHome ? styles.navActive : ''}`}
              aria-current={isHome ? 'page' : undefined}
              onClick={handleGoHome}
            >
              Home
            </Link>
            <Link
              to="/games"
              className={`${styles.navLink} ${isGames ? styles.navActive : ''}`}
              aria-current={isGames ? 'page' : undefined}
              onClick={closeAll}
            >
              Games
            </Link>
            <Link
              to="/rewards"
              className={`${styles.navLink} ${isRewards ? styles.navActive : ''}`}
              aria-current={isRewards ? 'page' : undefined}
              onClick={closeAll}
            >
              Rewards Store
            </Link>
            <Link
              to="/leaderboard"
              className={`${styles.navLink} ${isLeaderboard ? styles.navActive : ''}`}
              aria-current={isLeaderboard ? 'page' : undefined}
              onClick={closeAll}
            >
              Leaderboard
            </Link>
          </nav>
        </div>

        {/* Right side: balances + user actions */}
        <div className={styles.right}>
          {/* Coin balance */}
          <Link to="/rewards" className={styles.balancePill} onClick={closeAll} title="View Rewards Store">
            <img src="/assets/images/game-coin.jpeg" alt="" className={styles.balanceIcon} style={{ mixBlendMode: 'screen' }} />
            <span className={styles.balanceAmount}>{coinBalance.toLocaleString()}</span>
            <span className={styles.balanceLabel}>COINS</span>
          </Link>

          {/* Token balance */}
          <Link to="/rewards" className={styles.balancePill} onClick={closeAll} title="Refill Tokens in Rewards Store">
            <img src="/assets/images/token.jpeg" alt="" className={styles.balanceIcon} style={{ mixBlendMode: 'screen' }} />
            <span className={styles.balanceAmount}>{tokenBalance}</span>
            <span className={styles.balanceLabel}>TOKENS</span>
          </Link>

          <div className={styles.divider} aria-hidden="true" />

          {/* Notifications Button */}
          <button
            type="button"
            className={`${styles.iconBtn} ${showNotifs ? styles.iconBtnActive : ''}`}
            onClick={toggleNotifs}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            aria-expanded={showNotifs}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
            {unreadCount > 0 && <span className={styles.notifDot} aria-hidden="true" />}
          </button>

          {/* Sign In button if logged out */}
          {!user?.isLoggedIn && (
            <button
              type="button"
              className={styles.signInNavBtn}
              onClick={() => openAuth('signin')}
              aria-label="Sign In to VELoop"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>login</span>
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile Button */}
          <button
            type="button"
            className={`${styles.userBtn} ${showProfile || isProfile ? styles.userBtnActive : ''}`}
            onClick={toggleProfile}
            aria-label={user?.isLoggedIn ? `${user.name} Profile and Wallet` : 'Guest Profile'}
            aria-expanded={showProfile}
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.isLoggedIn ? user.name : 'Guest'}</span>
              <span
                className={styles.userLevel}
                style={{ color: user?.isLoggedIn ? '#fbbf24' : '#94a3b8' }}
              >
                {user?.isLoggedIn ? `VIP Level ${user.vipLevel}` : 'Tap to Sign In'}
              </span>
            </div>
            <div
              className={styles.avatar}
              style={{
                background: user?.isLoggedIn
                  ? (user.avatarGradient || 'linear-gradient(135deg, #2563eb, #1d4ed8)')
                  : '#334155',
              }}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {user?.isLoggedIn ? (user.avatar || 'sports_esports') : 'person_outline'}
              </span>
            </div>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={showMobileMenu}
          >
            <span className="material-symbols-outlined">
              {showMobileMenu ? 'close' : 'menu'}
            </span>
          </button>

          {/* -------------------------------------------------------------
              Notifications Dropdown Panel
              ------------------------------------------------------------- */}
          {showNotifs && (
            <div className={styles.dropdownPanel} role="dialog" aria-label="Notifications panel">
              <div className={styles.notifHeader}>
                <h3 className={styles.notifTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#60a5fa' }}>notifications</span>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                {unreadCount > 0 && (
                  <button type="button" className={styles.markReadBtn} onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.notifItem} ${item.unread ? styles.notifItemUnread : ''}`}
                      onClick={() => handleNotifClick(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.notifIconWrap} style={{ color: item.color }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                          {item.icon}
                        </span>
                      </div>
                      <div className={styles.notifContent}>
                        <div className={styles.notifText}>{item.title}</div>
                        <div className={styles.notifDesc}>{item.desc}</div>
                        <div className={styles.notifTime}>{item.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className={styles.notifFooter}>
                  <button type="button" className={styles.clearNotifsBtn} onClick={handleClearNotifs}>
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------------
              User Profile Dropdown Panel
              ------------------------------------------------------------- */}
          {showProfile && (
            <div className={styles.dropdownPanel} role="dialog" aria-label="Player Profile">
              {user?.isLoggedIn ? (
                /* Logged In View */
                <>
                  <div className={styles.profileHeader}>
                    <div
                      className={styles.profileAvatarLarge}
                      style={{ background: user.avatarGradient || 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                    >
                      <span className="material-symbols-outlined">{user.avatar || 'sports_esports'}</span>
                    </div>
                    <div className={styles.profileIdentity}>
                      <h3 className={styles.profileName}>{user.name}</h3>
                      <div className={styles.profileTierRow}>
                        <span className={styles.profileTierBadge}>VIP Level {user.vipLevel}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{user.vipTier || 'Gold Tier'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileBody}>
                    {/* Direct Profile Action Buttons */}
                    <div className={styles.profileBtnRow}>
                      <Link to="/profile" className={styles.profilePrimaryBtn} onClick={closeAll}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>account_circle</span>
                        My Profile
                      </Link>
                      <Link to="/profile?edit=true" className={styles.profileSecondaryBtn} onClick={closeAll}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        Update Profile
                      </Link>
                    </div>

                    {/* XP Progress to VIP Next */}
                    <div className={styles.xpSection}>
                      <div className={styles.xpHeader}>
                        <span>Progress to VIP {user.vipLevel + 1}</span>
                        <strong style={{ color: '#fff' }}>
                          {(user.xp || 7450).toLocaleString()} / {(user.xpNext || 10000).toLocaleString()} XP
                        </strong>
                      </div>
                      <div className={styles.xpTrack}>
                        <div
                          className={styles.xpFill}
                          style={{
                            width: `${Math.min(100, Math.round(((user.xp || 7450) / (user.xpNext || 10000)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Balances */}
                    <div className={styles.profileBalances}>
                      <div className={styles.profileBalCard}>
                        <img src="/assets/images/game-coin.jpeg" alt="Coins" style={{ mixBlendMode: 'screen' }} />
                        <div>
                          <div className={styles.profileBalNum}>{coinBalance.toLocaleString()}</div>
                          <div className={styles.profileBalLabel}>Game Coins</div>
                        </div>
                      </div>
                      <div className={styles.profileBalCard}>
                        <img src="/assets/images/token.jpeg" alt="Tokens" style={{ mixBlendMode: 'screen' }} />
                        <div>
                          <div className={styles.profileBalNum}>{tokenBalance}</div>
                          <div className={styles.profileBalLabel}>Match Tokens</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Refills */}
                    <div className={styles.profileActions}>
                      <button
                        type="button"
                        className={styles.demoActionBtn}
                        onClick={() => addTokens(50)}
                      >
                        <span>+ Add 50 Demo Tokens</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#38bdf8' }}>add_circle</span>
                      </button>
                      <button
                        type="button"
                        className={styles.demoActionBtn}
                        onClick={() => addCoins(500)}
                      >
                        <span>+ Add 500 Game Coins</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ffb95f' }}>paid</span>
                      </button>
                      <button
                        type="button"
                        className={styles.demoActionBtn}
                        onClick={resetDemo}
                        style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <span>Reset Demo Data</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restart_alt</span>
                      </button>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className={styles.profileNavLinks}>
                      <Link to="/rewards" className={styles.profileNavLink} onClick={closeAll}>
                        <span>Rewards Store &amp; Exchange</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                      </Link>
                      <Link to="/leaderboard" className={styles.profileNavLink} onClick={closeAll}>
                        <span>Competitive Leaderboard</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                      </Link>
                      <Link to="/" className={styles.profileNavLink} onClick={handleGoHome}>
                        <span>VELoop Games Home</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                      </Link>
                    </div>

                    {/* Log Out Button */}
                    <button
                      type="button"
                      className={styles.logoutDropdownBtn}
                      onClick={() => {
                        logout();
                        closeAll();
                      }}
                    >
                      <span>Log Out of Account</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Guest View */
                <>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileAvatarLarge} style={{ background: '#334155', borderColor: '#64748b' }}>
                      <span className="material-symbols-outlined">person_outline</span>
                    </div>
                    <div className={styles.profileIdentity}>
                      <h3 className={styles.profileName}>Guest Player</h3>
                      <div className={styles.profileTierRow}>
                        <span className={styles.profileTierBadge} style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}>
                          Guest Session
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileBody}>
                    <div className={styles.guestAuthBox}>
                      <p className={styles.guestAuthDesc}>
                        Sign in or create an account to save high scores, earn VIP perks, and sync rewards.
                      </p>
                      <button
                        type="button"
                        className={`${styles.guestActionBtn} ${styles.guestSignInBtn}`}
                        onClick={() => openAuth('signin')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>login</span>
                        Sign In
                      </button>
                      <button
                        type="button"
                        className={`${styles.guestActionBtn} ${styles.guestSignUpBtn}`}
                        onClick={() => openAuth('signup')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                        Create Account (+50 Tokens)
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.demoActionBtn}
                      onClick={() => {
                        login({
                          name: 'Alex Morgan',
                          username: 'alex_veloop',
                          email: 'alex.morgan@veloop.io',
                          avatar: 'sports_esports',
                        });
                        closeAll();
                      }}
                      style={{ marginBottom: 14, borderColor: 'rgba(251, 191, 36, 0.4)' }}
                    >
                      <span style={{ color: '#fbbf24' }}>⚡ Instant VIP 4 Demo Login</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fbbf24' }}>bolt</span>
                    </button>

                    {/* Balances */}
                    <div className={styles.profileBalances}>
                      <div className={styles.profileBalCard}>
                        <img src="/assets/images/game-coin.jpeg" alt="Coins" style={{ mixBlendMode: 'screen' }} />
                        <div>
                          <div className={styles.profileBalNum}>{coinBalance.toLocaleString()}</div>
                          <div className={styles.profileBalLabel}>Game Coins</div>
                        </div>
                      </div>
                      <div className={styles.profileBalCard}>
                        <img src="/assets/images/token.jpeg" alt="Tokens" style={{ mixBlendMode: 'screen' }} />
                        <div>
                          <div className={styles.profileBalNum}>{tokenBalance}</div>
                          <div className={styles.profileBalLabel}>Match Tokens</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Demo Refills */}
                    <div className={styles.profileActions}>
                      <button
                        type="button"
                        className={styles.demoActionBtn}
                        onClick={() => addTokens(50)}
                      >
                        <span>+ Add 50 Demo Tokens</span>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#38bdf8' }}>add_circle</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Mobile Navigation Menu Drawer (Screens < 1024px)
          ------------------------------------------------------------- */}
      {showMobileMenu && (
        <div className={styles.mobileMenuDrawer} role="menu" aria-label="Mobile navigation">
          <Link
            to="/"
            className={`${styles.mobileLink} ${isHome ? styles.mobileLinkActive : ''}`}
            onClick={handleGoHome}
          >
            <span className="material-symbols-outlined">home</span>
            Home
          </Link>
          <Link
            to="/games"
            className={`${styles.mobileLink} ${isGames ? styles.mobileLinkActive : ''}`}
            onClick={closeAll}
          >
            <span className="material-symbols-outlined">sports_esports</span>
            Games
          </Link>
          <Link
            to="/rewards"
            className={`${styles.mobileLink} ${isRewards ? styles.mobileLinkActive : ''}`}
            onClick={closeAll}
          >
            <span className="material-symbols-outlined">redeem</span>
            Rewards Store
          </Link>
          <Link
            to="/leaderboard"
            className={`${styles.mobileLink} ${isLeaderboard ? styles.mobileLinkActive : ''}`}
            onClick={closeAll}
          >
            <span className="material-symbols-outlined">leaderboard</span>
            Leaderboard
          </Link>
        </div>
      )}

      {/* Auth Modal for Sign In / Sign Up */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Backdrop overlay to close open dropdowns when clicking outside */}
      {(showNotifs || showProfile || showMobileMenu) && (
        <div className={styles.dropdownOverlay} onClick={closeAll} aria-hidden="true" />
      )}
    </header>
  );
}
