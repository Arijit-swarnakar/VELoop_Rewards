import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import styles from './AuthModal.module.css';

const AVATAR_OPTIONS = [
  { id: 'sports_esports', label: 'Arcade Master', gradient: 'linear-gradient(135deg, #2563eb, #38bdf8)' },
  { id: 'swords', label: 'Blade Warrior', gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
  { id: 'smart_toy', label: 'Cyber Bot', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
  { id: 'shield', label: 'Guardian', gradient: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { id: 'bolt', label: 'Speedster', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { id: 'psychology', label: 'Puzzle Mind', gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)' },
  { id: 'military_tech', label: 'Grand Champion', gradient: 'linear-gradient(135deg, #ca8a04, #fde047)' },
  { id: 'rocket_launch', label: 'Cosmic Ace', gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)' },
];

export default function AuthModal({ isOpen, initialMode = 'signin', onClose }) {
  const { login, signup } = useGame();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  // Sign In form fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Status & error
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with prop
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setError('Please enter your email or username');
      return;
    }
    setError('');
    const cleanUser = signInEmail.includes('@') ? signInEmail.split('@')[0] : signInEmail;
    login({
      email: signInEmail.includes('@') ? signInEmail : `${signInEmail}@veloop.io`,
      name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
      username: cleanUser.toLowerCase(),
    });
    setSuccessMsg('Welcome back to VELoop Rewards!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDemoSignIn = () => {
    login({
      email: 'alex.morgan@veloop.io',
      name: 'Alex Morgan',
      username: 'alex_veloop',
      avatar: 'sports_esports',
    });
    setSuccessMsg('Logged in as Alex Morgan (VIP 4)!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your display name');
      return;
    }
    if (!username.trim()) {
      setError('Please choose a gamer tag / username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    signup({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      avatar: selectedAvatar.id,
      avatarGradient: selectedAvatar.gradient,
    });
    setSuccessMsg('Account created! +50 Tokens & +500 Coins added!');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <img
              src="/assets/images/veloop-logo.jpg"
              alt=""
              style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }}
            />
            VELoop GAMES
          </div>
          <h2 className={styles.title}>
            {mode === 'signin' ? 'Sign In to Your Account' : 'Create Player Account'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'signin'
              ? 'Access your saved tokens, coins, and VIP progress'
              : 'Join to earn Game Coins, spin the wheel, and climb leaderboards'}
          </p>
        </div>

        {/* Tab switch */}
        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${mode === 'signin' ? styles.tabBtnActive : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>login</span>
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className={styles.body}>
          {error && (
            <div className={styles.errorMsg}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className={styles.bonusBanner} style={{ borderColor: '#34d399', background: 'rgba(16, 185, 129, 0.15)' }}>
              <span className="material-symbols-outlined" style={{ color: '#34d399', fontSize: 22 }}>check_circle</span>
              <span className={styles.bonusText} style={{ color: '#ecfdf5', fontWeight: 600 }}>{successMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email or Gamer Tag</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. alex.morgan@veloop.io"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                Sign In to Play
              </button>

              <button type="button" className={styles.demoLoginBtn} onClick={handleDemoSignIn}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fbbf24' }}>bolt</span>
                Instant VIP 4 Demo Login (Alex Morgan)
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Welcome Bonus Callout */}
              <div className={styles.bonusBanner}>
                <span className={`material-symbols-outlined ${styles.bonusIcon}`}>card_giftcard</span>
                <div className={styles.bonusText}>
                  Welcome Perk: <span className={styles.bonusStrong}>+50 Match Tokens &amp; +500 Game Coins</span> automatically credited upon registration!
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Display Name</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Gamer Tag / Username</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>alternate_email</span>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. blade_legend"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="player@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarHeader}>
                  <span className={styles.label}>Choose Avatar</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{selectedAvatar.label}</span>
                </div>
                <div className={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`${styles.avatarOption} ${selectedAvatar.id === av.id ? styles.avatarOptionSelected : ''}`}
                      style={{ background: av.gradient }}
                      onClick={() => setSelectedAvatar(av)}
                      title={av.label}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        {av.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>how_to_reg</span>
                Create Account &amp; Claim Bonus
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
