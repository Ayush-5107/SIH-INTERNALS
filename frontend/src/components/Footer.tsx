'use client';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <a href="/" className={styles.footerLogo}>
              <div className={styles.logoIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span>FoodTrace.</span>
            </a>
            <p className={styles.brandDesc}>
              The national food traceability and risk intelligence infrastructure connecting agricultural producers, processors, logistics fleets, retailers, and consumers.
            </p>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className={styles.colTitle}>Applications</h4>
            <ul className={styles.linkList}>
              <li><a href="/dashboard" className={styles.footerLink}>Admin Console</a></li>
              <li><a href="/dashboard/regulator" className={styles.footerLink}>Regulator Audit Portal</a></li>
              <li><a href="/verify" className={styles.footerLink}>Scratch &amp; Verify QR</a></li>
              <li><a href="/feedback" className={styles.footerLink}>Consumer Feedback</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className={styles.colTitle}>Traceability</h4>
            <ul className={styles.linkList}>
              <li><a href="/dashboard/batches" className={styles.footerLink}>Production Batches</a></li>
              <li><a href="/dashboard/units" className={styles.footerLink}>Serialized Units</a></li>
              <li><a href="/dashboard/recall" className={styles.footerLink}>Risk &amp; Recalls</a></li>
              <li><a href="/one-food?ref=batch-orange-001-raw" className={styles.footerLink}>Batch Explorer</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className={styles.colTitle}>Compliance &amp; Infrastructure</h4>
            <ul className={styles.linkList}>
              <li><a href="/dashboard/admin" className={styles.footerLink}>System Liveness</a></li>
              <li><a href="/#knowledge" className={styles.footerLink}>GS1 Digital Link URI</a></li>
              <li><a href="/#knowledge" className={styles.footerLink}>Hyperledger Fabric v2.5</a></li>
              <li><a href="/#knowledge" className={styles.footerLink}>IPFS Evidence Vault</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <p>© 2026 FoodTrace National Infrastructure. All rights reserved.</p>

          <div className={styles.socialRow}>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
