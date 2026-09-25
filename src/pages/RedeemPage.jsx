import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { REDEEM_OPTIONS } from '../data/games';
import styles from './RedeemPage.module.css';

export default function RedeemPage() {
  const { coinBalance, tokenBalance, redeem, addTokens, addCoins, redemptionHistory } = useGame();

  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  // Daily Streak State
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [streakNotice, setStreakNotice] = useState('');

  // Lucky Spin Wheel State
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelNotice, setWheelNotice] = useState('');

  const handleOpenModal = (opt) => {
    setSelectedOption(opt);
    setQuantity(1);
    setSuccessMsg('');
  };

  const handleCloseModal = () => {
    setSelectedOption(null);
    setQuantity(1);
  };

  const totalCost = selectedOption ? quantity * selectedOption.rate : 0;
  const hasSufficientCoins = coinBalance >= totalCost;
  const remainingBalance = coinBalance - totalCost;

  const handleConfirmRedeem = () => {
    if (!selectedOption || !hasSufficientCoins || quantity <= 0) return;

    const ok = redeem({
      category: selectedOption.id,
      label: selectedOption.label,
      coinsSpent: totalCost,
      unitsReceived: quantity,
    });

    if (ok) {
      // If player redeemed Tokens, credit Token balance directly
      if (selectedOption.id === 'tokens') {
        addTokens(quantity);
      }

      setSuccessMsg(`Successfully converted ${totalCost.toLocaleString()} Coins into ${quantity} ${selectedOption.unit}!`);
      setTimeout(() => {
        handleCloseModal();
      }, 1800);
    }
  };

  // Claim Daily Streak
  const handleClaimStreak = () => {
    if (streakClaimed) return;
    addTokens(25);
    addCoins(100);
    setStreakClaimed(true);
    setStreakNotice('Claimed Day 4 Bonus: +25 Tokens & +100 Game Coins!');
    setTimeout(() => setStreakNotice(''), 4000);
  };

  // Spin Lucky Wheel
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelNotice('');

    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + extraSpins * 360 + randomAngle;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      setWheelSpinning(false);
      const prizes = [
        { label: '+250 Coins', coins: 250, tokens: 0 },
        { label: '+50 Tokens', coins: 0, tokens: 50 },
        { label: '+500 Coins', coins: 500, tokens: 0 },
        { label: '+30 Tokens', coins: 0, tokens: 30 },
        { label: '+1,000 Coins (JACKPOT)', coins: 1000, tokens: 0 },
      ];
      const win = prizes[Math.floor(Math.random() * prizes.length)];
      if (win.coins > 0) addCoins(win.coins);
      if (win.tokens > 0) addTokens(win.tokens);
      setWheelNotice(`🎉 Lucky Wheel Prize: ${win.label}! Balances updated.`);
    }, 2600);
  };

  const streakDays = [
    { day: 1, reward: '+50 C', status: 'claimed' },
    { day: 2, reward: '+15 T', status: 'claimed' },
    { day: 3, reward: '+100 C', status: 'claimed' },
    { day: 4, reward: '+25 T', status: streakClaimed ? 'claimed' : 'active' },
    { day: 5, reward: '+200 C', status: 'locked' },
    { day: 6, reward: '+50 T', status: 'locked' },
    { day: 7, reward: 'MEGA', status: 'locked' },
  ];

  return (
    <div className={styles.page}>
      {/* Hero Overview */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.pillTag}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>currency_exchange</span>
            Rewards Store &amp; Conversion Hub
          </div>
          <h1 className={styles.title}>Rewards &amp; Redemption Center</h1>
          <p className={styles.subtitle}>
            Convert your in-game earnings into VELoop ecosystem rewards, premium currencies, lucky spin bonuses, and gameplay tokens.
          </p>

          {/* Central Balances Bar */}
          <div className={styles.balancesRow}>
            <div className={styles.balanceBox} title="Central Game Coin Balance">
              <img src="/assets/images/game-coin.jpeg" alt="Game Coin" className={styles.balanceIcon} />
              <div className={styles.balanceDetails}>
                <div className={styles.balanceLabel}>Available Game Coins</div>
                <div className={styles.balanceValue}>{coinBalance.toLocaleString()}</div>
              </div>
            </div>

            <div className={styles.balanceBox} title="Active Match Token Wallet">
              <img src="/assets/images/token.jpeg" alt="Token" className={styles.balanceIcon} />
              <div className={styles.balanceDetails}>
                <div className={styles.balanceLabel}>Current Token Wallet</div>
                <div className={styles.balanceValue}>{tokenBalance.toLocaleString()} Tokens</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Streak & Lucky Wheel Perks */}
      <div className={styles.perksGrid}>
        {/* 7-Day Streak Calendar */}
        <div className={styles.perkCard}>
          <div className={styles.perkHeader}>
            <h2 className={styles.perkTitle}>
              <span className="material-symbols-outlined" style={{ color: '#ffb95f' }}>calendar_month</span>
              7-Day Daily Streak
            </h2>
            <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>Active: Day 4</span>
          </div>

          <div className={styles.streakDays}>
            {streakDays.map((s) => (
              <div
                key={s.day}
                className={`${styles.streakDay} ${
                  s.status === 'claimed'
                    ? styles.streakDayClaimed
                    : s.status === 'active'
                    ? styles.streakDayActive
                    : ''
                }`}
              >
                <span>Day {s.day}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {s.status === 'claimed' ? 'check_circle' : 'stars'}
                </span>
                <strong>{s.reward}</strong>
              </div>
            ))}
          </div>

          {streakNotice && (
            <div style={{ color: '#34d399', fontSize: 12, marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
              {streakNotice}
            </div>
          )}

          <button
            type="button"
            className={styles.streakClaimBtn}
            onClick={handleClaimStreak}
            disabled={streakClaimed}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>redeem</span>
            {streakClaimed ? 'Today\'s Reward Claimed' : 'Claim Day 4 Reward (+25 Tokens & +100 Coins)'}
          </button>
        </div>

        {/* Lucky Spin Wheel */}
        <div className={`${styles.perkCard} ${styles.wheelCard}`}>
          <div className={styles.perkHeader} style={{ width: '100%' }}>
            <h2 className={styles.perkTitle}>
              <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>casino</span>
              Lucky Spin Wheel
            </h2>
            <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>1 Free Spin Available</span>
          </div>

          <div
            className={styles.wheelGraphic}
            style={{ transform: `rotate(${wheelRotation}deg)` }}
            aria-hidden="true"
          >
            <div className={styles.wheelCenter}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>star</span>
            </div>
          </div>

          {wheelNotice && (
            <div style={{ color: '#fbbf24', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>
              {wheelNotice}
            </div>
          )}

          <button
            type="button"
            className={styles.spinBtn}
            onClick={handleSpinWheel}
            disabled={wheelSpinning}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {wheelSpinning ? 'sync' : 'auto_mode'}
            </span>
            {wheelSpinning ? 'Spinning Wheel...' : 'Spin the Wheel (Free)'}
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Available Reward Conversions</h2>
        <span className={styles.demoDisclaimer}>*Illustrative demo rates</span>
      </div>

      <div className={styles.grid}>
        {REDEEM_OPTIONS.map((opt) => (
          <article key={opt.id} className={styles.card}>
            <div className={styles.cardBanner}>
              <img src={opt.image} alt={opt.label} className={styles.cardImg} />
              <div className={styles.cardOverlay} />
              <div className={styles.cardBadge}>{opt.rate} Coins / {opt.unit}</div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{opt.label}</h3>
              <p className={styles.cardDesc}>{opt.description}</p>

              <div className={styles.cardRateRow}>
                <span className={styles.rateLabel}>Exchange Rate</span>
                <span className={styles.rateValue}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ffb95f' }}>monetization_on</span>
                  {opt.rate} = 1 {opt.unit}
                </span>
              </div>

              <button
                type="button"
                className={styles.cardBtn}
                onClick={() => handleOpenModal(opt)}
                aria-label={`Convert Game Coins to ${opt.label}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_horiz</span>
                Convert Coins
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Redemption Calculator Modal */}
      {selectedOption && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>

            <div className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>Redeem {selectedOption.label}</h2>
              <p className={styles.modalSubtitle}>Select how many {selectedOption.unit} you would like to convert.</p>
            </div>

            {/* Stepper */}
            <div className={styles.stepperSection}>
              <span className={styles.stepperLabel}>Amount to Receive ({selectedOption.unit})</span>
              <div className={styles.stepperRow}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className={styles.stepperInput}>{quantity}</span>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <div className={styles.quickPills}>
                {[1, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={styles.quickPill}
                    onClick={() => setQuantity(amt)}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Math Breakdown */}
            <div className={styles.mathBox}>
              <div className={styles.mathRow}>
                <span>Conversion Rate:</span>
                <span>{selectedOption.rate} Coins / {selectedOption.unit}</span>
              </div>
              <div className={styles.mathRow}>
                <span>Total Coin Cost:</span>
                <span style={{ color: '#ffb95f', fontWeight: 700 }}>{totalCost.toLocaleString()} Coins</span>
              </div>
              <div className={styles.mathRow}>
                <span>Your Current Balance:</span>
                <span>{coinBalance.toLocaleString()} Coins</span>
              </div>
              <div className={`${styles.mathRow} ${styles.mathRowHighlight}`}>
                <span>Remaining Balance:</span>
                <span style={{ color: hasSufficientCoins ? '#34d399' : '#f87171' }}>
                  {hasSufficientCoins ? `${remainingBalance.toLocaleString()} Coins` : 'Insufficient Funds'}
                </span>
              </div>
            </div>

            {/* Warnings or Success Msg */}
            {!hasSufficientCoins && (
              <div className={styles.insufficientWarning}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
                <span>You do not have enough Game Coins for this conversion. Play games to earn more!</span>
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: 10, padding: 12, color: '#34d399', textAlign: 'center', marginBottom: 16 }}>
                {successMsg}
              </div>
            )}

            {/* Actions */}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={handleConfirmRedeem}
                disabled={!hasSufficientCoins || quantity <= 0 || !!successMsg}
              >
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption History Table */}
      <section className={styles.historySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Redemption History</h2>
          <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            Back to Games
          </Link>
        </div>

        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.historyTh}>Item</th>
              <th className={styles.historyTh}>Quantity</th>
              <th className={styles.historyTh}>Coins Spent</th>
              <th className={styles.historyTh}>Date</th>
            </tr>
          </thead>
          <tbody>
            {redemptionHistory.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.historyEmpty}>
                  No redemptions yet. Convert your Game Coins to see your history here!
                </td>
              </tr>
            ) : (
              redemptionHistory.map((item) => (
                <tr key={item.id}>
                  <td className={styles.historyTd}>
                    <strong>{item.label}</strong>
                  </td>
                  <td className={styles.historyTd}>+{item.unitsReceived}</td>
                  <td className={styles.historyTd} style={{ color: '#ffb95f' }}>
                    -{item.coinsSpent.toLocaleString()} Coins
                  </td>
                  <td className={styles.historyTd} style={{ color: '#94a3b8' }}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
