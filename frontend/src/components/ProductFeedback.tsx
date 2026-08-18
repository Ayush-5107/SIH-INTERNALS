"use client";
import { useState } from "react";
import styles from "./ProductFeedback.module.css";

interface FeedbackCategory {
  id: string;
  icon: string;
  label: string;
  sub: string;
  severity: "low" | "medium" | "high" | "critical";
  layerImpact: string;
}

const CATEGORIES: FeedbackCategory[] = [
  {
    id: "damaged_pkg",
    icon: "📦",
    label: "Damaged Packaging",
    sub: "Torn seal, crushed carton, or nitrogen leak",
    severity: "medium",
    layerImpact: "Logistics / Warehouse",
  },
  {
    id: "poor_quality",
    icon: "🌾",
    label: "Poor Product Quality",
    sub: "Discoloration, foreign grain, or texture defect",
    severity: "medium",
    layerImpact: "Processor Milling",
  },
  {
    id: "wrong_label",
    icon: "🏷️",
    label: "Incorrect Labelling",
    sub: "Mismatched weight, expiry, or allergen omission",
    severity: "low",
    layerImpact: "Packaging Plant",
  },
  {
    id: "contamination",
    icon: "⚠️",
    label: "Suspected Contamination",
    sub: "Unusual odor, pest traces, or chemical smell",
    severity: "critical",
    layerImpact: "Origin Farm / Mill (Immediate POS Lock)",
  },
  {
    id: "expired",
    icon: "⏱️",
    label: "Expired Product",
    sub: "Passed best-before date on retail shelf",
    severity: "high",
    layerImpact: "Retail POS Inventory",
  },
  {
    id: "other",
    icon: "💬",
    label: "Other Concerns",
    sub: "General sensory or taste feedback",
    severity: "low",
    layerImpact: "Brand Quality Council",
  },
];

export default function ProductFeedback() {
  const [selectedCat, setSelectedCat] = useState<FeedbackCategory>(
    CATEGORIES[0],
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [comments, setComments] = useState<string>(
    "Found slight moisture softening on outer carton.",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className={styles.section} id="feedback">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className="eyebrow">CLOSED-LOOP QUALITY ASSURANCE</span>
            <h2 className={styles.title}>
              Product Feedback:{" "}
              <strong>Direct accountability from fork to farm.</strong>
            </h2>
          </div>
          <p className={styles.lead}>
            The QR code is not just for one-way verification — it creates a
            direct, authenticated feedback loop that connects consumer
            experience back to the exact batch and processing node.
          </p>
        </div>

        {/* 6-Step Feedback Flow Strip */}
        <div className={styles.flowBar}>
          <div className={styles.flowStep}>
            <span className={styles.flowNum}>01</span>
            <span className={styles.flowLabel}>Scan QR</span>
          </div>
          <span className={styles.flowChevron}>→</span>

          <div className={styles.flowStep}>
            <span className={styles.flowNum}>02</span>
            <span className={styles.flowLabel}>Verify Journey</span>
          </div>
          <span className={styles.flowChevron}>→</span>

          <div className={styles.flowStep}>
            <span className={styles.flowNum}>03</span>
            <span className={styles.flowLabel}>Experience Product</span>
          </div>
          <span className={styles.flowChevron}>→</span>

          <div className={styles.flowStep}>
            <span className={styles.flowNum}>04</span>
            <span className={styles.flowLabel}>Report Feedback</span>
          </div>
          <span className={styles.flowChevron}>→</span>

          <div className={styles.flowStep}>
            <span className={styles.flowNum}>05</span>
            <span className={styles.flowLabel}>Trace Back to Node</span>
          </div>
          <span className={styles.flowChevron}>→</span>

          <div className={styles.flowStep}>
            <span className={styles.flowNum}>06</span>
            <span className={styles.flowLabel}>Take Action / Recall</span>
          </div>
        </div>

        {/* Interactive Feedback & Traceback Simulator */}
        <div className={styles.grid}>
          {/* Left: Feedback Category Selector */}
          <div className={styles.leftCol}>
            <span className={styles.colTitle}>
              SELECT ISSUE CATEGORY (SIMULATED CONSUMER REPORT)
            </span>
            <div className={styles.categoryList}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`${styles.catCard} ${selectedCat.id === cat.id ? styles.catCardSelected : ""}`}
                  onClick={() => {
                    setSelectedCat(cat);
                    setSubmitted(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.catLeft}>
                    <span className={styles.catEmoji}>{cat.icon}</span>
                    <div>
                      <h4 className={styles.catName}>{cat.label}</h4>
                      <p className={styles.catSub}>{cat.sub}</p>
                    </div>
                  </div>
                  <span
                    className={`chip chip--${cat.severity === "critical" ? "red" : cat.severity === "high" ? "amber" : "green"}`}
                  >
                    {cat.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Automated Traceback & Escalation View */}
          <div className={styles.rightCol}>
            <div className={styles.feedbackConsole}>
              <div className={styles.consoleHead}>
                <span className={styles.consoleBadge}>
                  AUTOMATED TRACEBACK ROUTER
                </span>
                <span className={styles.batchTag}>BATCH: WF-2026-0815</span>
              </div>

              <div className={styles.consoleBody}>
                <div className={styles.reportFormWrap}>
                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Selected Anomaly
                      </label>
                      <div className={styles.selectedBox}>
                        <span>
                          {selectedCat.icon}{" "}
                          <strong>{selectedCat.label}</strong>
                        </span>
                        <span className={styles.targetLayer}>
                          Target Layer: {selectedCat.layerImpact}
                        </span>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Consumer Note / Description
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn--grass"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Submit Feedback to Blockchain Audit Trail →
                    </button>
                  </form>
                </div>

                {/* Automated Traceback Output */}
                <div className={styles.tracebackResult}>
                  <span className={styles.tracebackHead}>
                    ⚡ AUTOMATED ESCALATION PROTOCOL
                  </span>
                  <div className={styles.tracebackList}>
                    <div className={styles.traceRow}>
                      <span className={styles.traceKey}>
                        1. Root Node Identified:
                      </span>
                      <span className={styles.traceVal}>
                        Chakan Mill #04 &amp; Tathawade Hub
                      </span>
                    </div>
                    <div className={styles.traceRow}>
                      <span className={styles.traceKey}>
                        2. Action Dispatched:
                      </span>
                      <span
                        className={styles.traceVal}
                        style={{
                          color:
                            selectedCat.severity === "critical"
                              ? "var(--color-alert-red)"
                              : "var(--color-grass-500)",
                        }}
                      >
                        {selectedCat.severity === "critical"
                          ? "🚨 IMMEDIATE POS QUARANTINE DIRECTIVE"
                          : "✓ QA Audit Ticket #FT-2026-881 Generated"}
                      </span>
                    </div>
                    <div className={styles.traceRow}>
                      <span className={styles.traceKey}>3. Status:</span>
                      <span className={styles.traceVal}>
                        {submitted
                          ? "✓ Cryptographically committed to IPFS"
                          : "Ready for dispatch"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
