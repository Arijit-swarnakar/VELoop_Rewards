import { useState } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const modalData = {
    privacy: {
      title: 'Privacy Policy',
      icon: 'shield',
      content: (
        <>
          <p>
            At VELoop Rewards Ecosystem, your privacy and cryptographic vault security are our highest priorities.
          </p>
          <p>
            We collect only necessary account telemetry to track tournament score integrity, VIP rank accrual, and reward redemptions. We never sell or distribute your personal details to third parties.
          </p>
          <p>
            All on-chain balance snapshots and off-chain match sessions are encrypted end-to-end.
          </p>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: 'gavel',
      content: (
        <>
          <p>
            Welcome to VELoop Games &amp; Rewards. By accessing our platform, you agree to abide by community fair play guidelines and competitive tournament protocols.
          </p>
          <p>
            Automated scripts, botting, or exploiting client mechanics in games like Blade Master or Block Crush will result in forfeiture of points and account suspension.
          </p>
          <p>
            All token redemptions are final once verified against your account ledger.
          </p>
        </>
      ),
    },
    security: {
      title: 'Vault Security',
      icon: 'lock',
      content: (
        <>
          <p>
            VELoop leverages distributed cold storage protocols and real-time transaction ledger verification to protect match tokens and reward balances.
          </p>
          <p>
            Session signing, token generation, and coin transfers are validated using 256-bit AES encryption alongside fraud-prevention telemetry.
          </p>
          <p>
            If you detect suspicious account activity, contact our security response team immediately.
          </p>
        </>
      ),
    },
    help: {
      title: 'Help Center',
      icon: 'help',
      content: (
        <>
          <p>
            Need assistance with game controls, token refills, or reward exchange vouchers?
          </p>
          <p>
            &bull; <strong>Match Tokens:</strong> Each game round costs 20 Tokens. You can claim free drops from Daily Quests or use the demo refill in your profile menu.
          </p>
          <p>
            &bull; <strong>Rewards Hub:</strong> Exchange your Game Coins for luxury perks and digital gift cards in the Rewards Store.
          </p>
          <p>
            &bull; <strong>Support:</strong> Email us at <em>support@veloop.io</em> or join our Discord community for 24/7 gamer assistance.
          </p>
        </>
      ),
    },
  };

  return (
    <>
      <footer className={styles.footer} role="contentinfo" aria-label="VELoop Global Footer">
        <div className={styles.inner}>
          {/* Left Brand and Copyright */}
          <div className={styles.left}>
            <span className={styles.brand}>VELoop</span>
            <span className={styles.copyright}>
              &copy; 2025 VELoop Rewards Ecosystem. All rights reserved.
            </span>
          </div>

          {/* Right Navigation Links */}
          <nav className={styles.nav} aria-label="Footer links">
            <button
              type="button"
              className={styles.link}
              onClick={() => setActiveModal('privacy')}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className={styles.link}
              onClick={() => setActiveModal('terms')}
            >
              Terms of Service
            </button>
            <button
              type="button"
              className={styles.link}
              onClick={() => setActiveModal('security')}
            >
              Vault Security
            </button>
            <button
              type="button"
              className={styles.link}
              onClick={() => setActiveModal('help')}
            >
              Help Center
            </button>
          </nav>
        </div>
      </footer>

      {/* Info Modal */}
      {activeModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>
                  {modalData[activeModal]?.icon}
                </span>
                {modalData[activeModal]?.title}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalData[activeModal]?.content}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalActionBtn}
                onClick={() => setActiveModal(null)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
