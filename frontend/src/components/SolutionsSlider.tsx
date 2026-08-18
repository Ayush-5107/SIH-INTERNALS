'use client';
import { useState } from 'react';
import styles from './SolutionsSlider.module.css';

interface SolutionTab {
  id: string;
  tabLabel: string;
  eyebrow: string;
  title: string;
  strongPart: string;
  desc: string;
  img: string;
  link: string;
}

const TABS: SolutionTab[] = [
  {
    id: '0',
    tabLabel: '01 / Origin & Soil Protocol',
    eyebrow: 'AGRICULTURAL MINTING',
    title: 'Farmer harvest assets registered with ',
    strongPart: 'GPS & organic soil lab proof.',
    desc: 'Each raw batch is minted directly at field origin with W3C digital twin credentials, pesticide assay certificates, and IPFS content-addressed storage.',
    img: '/images/logineko/farming-at-logineko-1.jpg',
    link: '/dashboard/batches',
  },
  {
    id: '1',
    tabLabel: '02 / Recursive Lineage DAG',
    eyebrow: 'PROCESSING & MILLING INFRASTRUCTURE',
    title: 'Multi-parent grain blending preserved ',
    strongPart: 'without losing origin links.',
    desc: 'When sortex mills blend harvests from multiple farms, FoodTrace commits directed acyclic graph edges to PostgreSQL and Hyperledger Fabric to maintain bidirectional traceability.',
    img: '/images/logineko/farming-software-maps-solution.jpg',
    link: '/one-food?ref=batch-orange-001-raw',
  },
  {
    id: '2',
    tabLabel: '03 / Dual-QR Anti-Cloning',
    eyebrow: 'PACKAGING AUTHENTICITY',
    title: 'Physical packaging meets ',
    strongPart: 'cryptographic seal verification.',
    desc: 'An open GS1 Digital Link outer QR code enables consumer journey inspection, while a concealed ECDSA inner credential under a scratch seal guarantees anti-counterfeit proof.',
    img: '/images/logineko/origin-solutions-for-transaprency-1536x1025.jpg',
    link: '/one-food?ref=batch-orange-001-raw',
  },
  {
    id: '3',
    tabLabel: '04 / Real-Time Risk Engine',
    eyebrow: 'AUTOMATED BLAST TRAVERSAL',
    title: 'Consumer anomaly signals trigger ',
    strongPart: 'automated POS lot freezes in < 200ms.',
    desc: 'Statistical deviations cluster complaints by SKU and regional hub. The risk engine traverses the DAG to isolate the exact root cause and freeze only affected units.',
    img: '/images/logineko/food-development-solutions.jpg',
    link: '/dashboard/recall',
  },
];

export default function SolutionsSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = TABS[activeIdx];

  return (
    <section className={styles.blockSolutions} id="solutions">
      <div className="container">
        <header className="section-intro section-intro--center">
          <span className="eyebrow">HOW WE DO IT</span>
          <h2 className="heading-2">
            We test in the field, <strong>then prove what works.</strong>
          </h2>
          <p className="lead" style={{ margin: '0 auto', maxWidth: '640px' }}>
            Explore the four foundational modules that power end-to-end transparency across the food supply chain.
          </p>
        </header>

        {/* Tab Navigation Pill Row */}
        <div className={styles.navRow} role="tablist" aria-label="Solutions tabs">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.navBtn} ${activeIdx === idx ? styles.navBtnActive : ''}`}
              onClick={() => setActiveIdx(idx)}
              role="tab"
              aria-selected={activeIdx === idx}
            >
              {tab.tabLabel}
            </button>
          ))}
        </div>

        {/* Active Solution Display Card */}
        <div
          className={styles.solutionCard}
          style={{ backgroundImage: `url('${current.img}')` }}
        >
          <div className={styles.cardOverlay} />
          <div className={styles.cardContent}>
            <div className={styles.cardLeft}>
              <span className={styles.cardEyebrow}>{current.eyebrow}</span>
              <h3 className={styles.cardTitle}>
                {current.title}
                <strong>{current.strongPart}</strong>
              </h3>
              <p className={styles.cardDesc}>{current.desc}</p>
            </div>

            <a href={current.link} className="arrow-circle" aria-label="Explore solution details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
