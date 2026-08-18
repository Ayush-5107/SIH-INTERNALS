"use client";
import { useState } from "react";
import styles from "./HowWeDoIt.module.css";

interface Step {
  num: string;
  title: string;
  tagline: string;
  summary: string;
  badge: string;
  visualType: "register" | "track" | "verify" | "monitor" | "engage";
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Register",
    tagline: "Genesis Origin Minting",
    summary:
      "Product and batch information enters the system at the farm or collection point.",
    badge: "GENESIS BLOCK",
    visualType: "register",
  },
  {
    num: "02",
    title: "Track",
    tagline: "Continuous Custody Trail",
    summary:
      "Every stakeholder records custody handovers, lab tests, and IoT conditions.",
    badge: "EVENT STREAM",
    visualType: "track",
  },
  {
    num: "03",
    title: "Verify",
    tagline: "Dual-QR Physical Binding",
    summary:
      "QR-based verification connects the physical package with its digital identity.",
    badge: "GS1 DIGITAL LINK",
    visualType: "verify",
  },
  {
    num: "04",
    title: "Monitor",
    tagline: "Operational Intelligence",
    summary:
      "Businesses monitor the product journey, verify SLAs, and identify anomalies.",
    badge: "ANALYTICS & ALERTS",
    visualType: "monitor",
  },
  {
    num: "05",
    title: "Engage",
    tagline: "Direct Consumer Loop",
    summary:
      "Consumers scan, verify harvest details, and provide direct feedback into the ecosystem.",
    badge: "FEEDBACK & TRUST",
    visualType: "engage",
  },
];

export default function HowWeDoIt() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STEPS[activeStep];

  return (
    <section className={styles.section} id="how-it-works">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <span className="eyebrow">SYSTEM ARCHITECTURE IN 5 STEPS</span>
          <h2 className={styles.title}>
            How We Do It: <strong>From seed to scan.</strong>
          </h2>
          <p className={styles.lead}>
            A visual, five-step infrastructure that turns complex supply chains
            into instant, verifiable trust.
          </p>
        </div>

        {/* 5-Step Visual Progress Bar */}
        <div className={styles.stepsNav}>
          {STEPS.map((step, idx) => (
            <button
              key={step.num}
              type="button"
              className={`${styles.stepTab} ${activeStep === idx ? styles.stepTabActive : ""}`}
              onClick={() => setActiveStep(idx)}
            >
              <div className={styles.tabNumWrap}>
                <span className={styles.tabNum}>{step.num}</span>
                <span className={styles.tabTitle}>{step.title}</span>
              </div>
              <span className={styles.tabBadge}>{step.badge}</span>
            </button>
          ))}
        </div>

        {/* Visual Card Showcase */}
        <div className={styles.visualStage}>
          {/* Left Column: Visual Step Explanation */}
          <div className={styles.stageContent}>
            <div className={styles.stepNumLarge}>{current.num} // STEP</div>
            <h3 className={styles.stageTitle}>{current.title}</h3>
            <p className={styles.stageTagline}>{current.tagline}</p>
            <p className={styles.stageSummary}>{current.summary}</p>

            <div className={styles.stageBullets}>
              {current.visualType === "register" && (
                <>
                  <div className={styles.bulletItem}>
                    🌱 Soil health, seed variety &amp; GPS geofence logged
                  </div>
                  <div className={styles.bulletItem}>
                    🔒 Farmer W3C DID signature signs raw harvest weight
                  </div>
                  <div className={styles.bulletItem}>
                    ⚡ Immutable genesis transaction created on-chain
                  </div>
                </>
              )}
              {current.visualType === "track" && (
                <>
                  <div className={styles.bulletItem}>
                    📦 Multi-parent milling lineage DAG transformation
                  </div>
                  <div className={styles.bulletItem}>
                    🌡️ Real-time IoT temperature &amp; route telemetry
                  </div>
                  <div className={styles.bulletItem}>
                    🧪 NABL lab safety certificates linked to batch ID
                  </div>
                </>
              )}
              {current.visualType === "verify" && (
                <>
                  <div className={styles.bulletItem}>
                    🏷️ GS1 Digital Link serialized dynamic QR on pack
                  </div>
                  <div className={styles.bulletItem}>
                    🛡️ Anti-cloning dual-code prevents label counterfeits
                  </div>
                  <div className={styles.bulletItem}>
                    📲 Works on any standard smartphone camera (no app needed)
                  </div>
                </>
              )}
              {current.visualType === "monitor" && (
                <>
                  <div className={styles.bulletItem}>
                    📊 Live batch dispatch status and inventory health
                  </div>
                  <div className={styles.bulletItem}>
                    🚨 Automated quarantine lock dispatched in &lt; 200ms
                  </div>
                  <div className={styles.bulletItem}>
                    📈 SLA tracking across cold freight &amp; fulfillment hubs
                  </div>
                </>
              )}
              {current.visualType === "engage" && (
                <>
                  <div className={styles.bulletItem}>
                    🌾 Consumer views exact farmer payout &amp; harvest date
                  </div>
                  <div className={styles.bulletItem}>
                    ⭐ Direct sensory feedback &amp; defect reporting
                  </div>
                  <div className={styles.bulletItem}>
                    🔁 Closed-loop continuous quality improvement
                  </div>
                </>
              )}
            </div>

            <div className={styles.stepControls}>
              <button
                type="button"
                className="btn btn--outline"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              >
                ← Previous Step
              </button>
              <button
                type="button"
                className="btn btn--grass"
                onClick={() =>
                  setActiveStep((prev) => (prev + 1) % STEPS.length)
                }
              >
                {activeStep === STEPS.length - 1
                  ? "Back to Start ↺"
                  : "Next Step →"}
              </button>
            </div>
          </div>

          {/* Right Column: Mini UI Simulator / Visual Diagram */}
          <div className={styles.stageWidgetWrap}>
            <div className={styles.widgetCard}>
              <div className={styles.widgetHead}>
                <span className={styles.widgetDot} />
                <span className={styles.widgetDot} />
                <span className={styles.widgetDot} />
                <span className={styles.widgetTitle}>
                  STEP {current.num} // {current.badge}
                </span>
              </div>

              <div className={styles.widgetBody}>
                {current.visualType === "register" && (
                  <div className={styles.simRegister}>
                    <div className={styles.simHeader}>
                      <span className={styles.simIcon}>🌾</span>
                      <div>
                        <strong>GENESIS BATCH CREATION</strong>
                        <p>Nashik Organic Cluster #402</p>
                      </div>
                    </div>
                    <div className={styles.simDataGrid}>
                      <div className={styles.simRow}>
                        <span>CROP:</span>
                        <strong>Sharbati Wheat</strong>
                      </div>
                      <div className={styles.simRow}>
                        <span>QUANTITY:</span>
                        <strong>12,500 KG</strong>
                      </div>
                      <div className={styles.simRow}>
                        <span>ORGANIC CERT:</span>
                        <strong style={{ color: "var(--color-grass-500)" }}>
                          VERIFIED (NPOP/2026)
                        </strong>
                      </div>
                      <div className={styles.simRow}>
                        <span>DID SIGNATURE:</span>
                        <code>0x918f...44bc</code>
                      </div>
                    </div>
                    <div className={styles.simBadge}>
                      ✓ MINTED TO BLOCK #18,201
                    </div>
                  </div>
                )}

                {current.visualType === "track" && (
                  <div className={styles.simTrack}>
                    <div className={styles.simHeader}>
                      <span className={styles.simIcon}>⚙️</span>
                      <div>
                        <strong>LINEAGE TRANSFORMATION &amp; IOT</strong>
                        <p>Chakan Processing Mill → Cold Freight</p>
                      </div>
                    </div>
                    <div className={styles.simDagFlow}>
                      <div className={styles.simNode}>LOT-402 (Wheat)</div>
                      <span className={styles.simFlowArrow}>→ Milling →</span>
                      <div className={styles.simNode}>BATCH-0815 (Flour)</div>
                    </div>
                    <div className={styles.simIotBadge}>
                      <span>🌡️ Reefer Temp: 19.2°C (Safe)</span>
                      <span>📍 GPS: Express Highway (Mumbai Bound)</span>
                    </div>
                  </div>
                )}

                {current.visualType === "verify" && (
                  <div className={styles.simVerify}>
                    <div className={styles.simHeader}>
                      <span className={styles.simIcon}>🏷️</span>
                      <div>
                        <strong>DUAL-QR PHYSICAL VERIFICATION</strong>
                        <p>GS1 Digital Link URI Binding</p>
                      </div>
                    </div>
                    <div className={styles.simQrBox}>
                      <div className={styles.simQrMock}>
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="3" height="3" />
                          <rect x="18" y="14" width="3" height="3" />
                          <rect x="14" y="18" width="7" height="3" />
                        </svg>
                      </div>
                      <div className={styles.simQrDetails}>
                        <span className={styles.simQrCode}>
                          WF-2026-0815 #0482
                        </span>
                        <span className={styles.simQrStatus}>
                          ● Cryptographic Proof Valid
                        </span>
                        <span className={styles.simQrSub}>
                          GS1 Digital Link v1.2 Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {current.visualType === "monitor" && (
                  <div className={styles.simMonitor}>
                    <div className={styles.simHeader}>
                      <span className={styles.simIcon}>📊</span>
                      <div>
                        <strong>OPERATIONAL ANOMALY MONITOR</strong>
                        <p>Sub-Second Anomaly &amp; Recall Dispatch</p>
                      </div>
                    </div>
                    <div className={styles.simAlertBar}>
                      <span
                        style={{
                          color: "var(--color-grass-500)",
                          fontWeight: 700,
                        }}
                      >
                        ● ALL 8 NODES COMPLIANT
                      </span>
                      <span>SLA: 99.98%</span>
                    </div>
                    <div className={styles.simMetricsRow}>
                      <div className={styles.simMiniMetric}>
                        <span>Active Batches</span>
                        <strong>4,280</strong>
                      </div>
                      <div className={styles.simMiniMetric}>
                        <span>Avg Latency</span>
                        <strong>142ms</strong>
                      </div>
                      <div className={styles.simMiniMetric}>
                        <span>Quarantine SLA</span>
                        <strong>&lt; 200ms</strong>
                      </div>
                    </div>
                  </div>
                )}

                {current.visualType === "engage" && (
                  <div className={styles.simEngage}>
                    <div className={styles.simHeader}>
                      <span className={styles.simIcon}>📱</span>
                      <div>
                        <strong>CONSUMER TRUST &amp; FEEDBACK</strong>
                        <p>Direct POS-to-Farm Accountability</p>
                      </div>
                    </div>
                    <div className={styles.simRatingCard}>
                      <div className={styles.simStars}>★★★★★</div>
                      <p className={styles.simReviewText}>
                        &ldquo;Scan verified 100% Nashik organic wheat. Fresh
                        pack!&rdquo;
                      </p>
                      <span className={styles.simReviewer}>
                        Verified Consumer // Mumbai POS
                      </span>
                    </div>
                    <div className={styles.simFeedbackBadge}>
                      ✓ BINDED TO LOT WF-2026-0815
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
