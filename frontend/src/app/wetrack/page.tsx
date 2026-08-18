"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

interface StakeholderStory {
  id: string;
  number: string;
  role: string;
  tagline: string;
  quote: string;
  actor: string;
  location: string;
  icon: string;
  story: string;
  keyActions: string[];
  techProof: string;
  image: string;
}

const STORIES: StakeholderStory[] = [
  {
    id: "farmer",
    number: "01",
    role: "Farmer / Producer",
    tagline: "Where the food begins: Pure origin & genesis registration",
    quote:
      "For the first time, my harvest quality is permanently linked to my name, earning fair market premiums without middlemen dilution.",
    actor: "Ramesh Patil (Organic Farmer Cluster #402)",
    location: "Nashik Valley, Maharashtra",
    icon: "🌾",
    story:
      "The story starts in the soil. Before a single seed is sown, organic bio-fertilizer usage, GPS farm geofencing, and soil moisture levels are digitally logged. At harvest time, raw grain tonnage is cryptographically signed with the farmer’s decentralized ID (DID) and minted as the genesis asset on the ledger.",
    keyActions: [
      "Genesis crop registration with GPS polygon stamping",
      "Digital weighbridge manifest signed at harvest gate",
      "Fair-price escrow smart contract activated directly to farmer bank account",
    ],
    techProof:
      "W3C DID Signature · Polygon Geofence · Zero-Knowledge Origin Proof",
    image: "/images/logineko/field-operations-at-logineko-768x432.jpg",
  },
  {
    id: "processor",
    number: "02",
    role: "Processor / Manufacturer",
    tagline: "Precision transformation, optical sorting & safety compliance",
    quote:
      "We transform raw agricultural yields into certified packaged goods, preserving complete parent-child recursive lineage.",
    actor: "Sahyadri Milling & Processing Unit #04",
    location: "Chakan Industrial Hub, Pune",
    icon: "⚙️",
    story:
      "Raw grains arriving at the mill undergo pneumatic de-stoning, multi-stage optical laser sortex cleaning, and granulation testing. The lineage engine creates an immutable parent-child transformation graph that binds incoming farm batch IDs directly to the output flour lots.",
    keyActions: [
      "Multi-parent lot reconciliation with automated mass-balance check",
      "NABL laboratory analysis for zero pesticide residue (< 0.01 PPM)",
      "Automated batch creation linked to parent harvest genesis blocks",
    ],
    techProof:
      "Lineage DAG Transformation · NABL Lab COA on IPFS · Mass-Balance Audit",
    image: "/images/logineko/farming-software-maps-solution.jpg",
  },
  {
    id: "warehouse",
    number: "03",
    role: "Warehouse & Storage",
    tagline: "Continuous environmental custody & item serialization",
    quote:
      "Every carton in our cold-storage facility is continuously monitored for humidity and temperature excursions.",
    actor: "Central Cold Storage & Packaging Facility",
    location: "Tathawade Logistics Hub, Pune",
    icon: "📦",
    story:
      "Packaged commodities move into automated warehouses where IoT telemetry monitors ambient temperature (18°C) and relative humidity (54%). High-speed printers apply dynamic, serialized GS1 Digital Link QR codes to each individual consumer carton.",
    keyActions: [
      "Continuous IoT temperature & moisture logging with alert thresholds",
      "Unique dual-QR code printing per unit to prevent counterfeit duplication",
      "Automated pallet consolidation with aggregated cryptographic manifests",
    ],
    techProof: "IoT BLE Sensors · Serialized GS1 QR · Ambient Condition Logs",
    image: "/images/logineko/team-at-logineko-farm.jpg",
  },
  {
    id: "distributor",
    number: "04",
    role: "Distributor & Logistics",
    tagline: "Cold-chain freight transit & real-time dispatch tracking",
    quote:
      "Our refrigerated fleet streams GPS and temperature telemetry every 5 minutes along major delivery corridors.",
    actor: "AgriTransit Cold Fleet MH-12",
    location: "Mumbai-Pune Freight Expressway",
    icon: "🚚",
    story:
      "Refrigerated trucks pick up sealed pallets for transit across urban fulfillment corridors. BLE sensors broadcast tamper-evident seal verification and temperature stability. Any thermal shock or route deviation triggers an immediate blockchain event alert.",
    keyActions: [
      "Real-time GPS geofence tracking and transit milestone logging",
      "Automated e-Way bill and GST regulatory document verification",
      "Dock-to-dock custodial handover confirmation via cryptographic scan",
    ],
    techProof:
      "Telemetry Stream · E-Way Bill Integration · Tamper-Evident Seals",
    image: "/images/logineko/farming-at-logineko-1.jpg",
  },
  {
    id: "retailer",
    number: "05",
    role: "Retailer / Supermarket",
    tagline: "Inbound verification, shelf stock & autonomous POS lock",
    quote:
      "Inbound scanning verifies product authenticity instantly, with automatic recall lock capability built right into our barcode scanners.",
    actor: "GreenBasket Hypermarket Bandra",
    location: "Mumbai Retail Outlets",
    icon: "🏬",
    story:
      "Supermarket receiving docks scan incoming pallets to authenticate digital provenance. Stock is mapped to store shelves with full shelf-life tracking. In the event of a verified risk incident, central systems dispatch a barcode lock to POS terminals in under 200ms.",
    keyActions: [
      "Dock reception scan validating upstream chaincode endorsement",
      "Real-time retail shelf-life and freshness monitoring",
      "Sub-second POS checkout lock to prevent compromised batch sales",
    ],
    techProof:
      "Fabric Peer Node · POS Scanner API · Autonomous Quarantine Sync",
    image: "/images/logineko/logineko-who-we-are.jpg",
  },
  {
    id: "consumer",
    number: "06",
    role: "End Consumer / Citizen",
    tagline: "Point-of-consumption verification & direct feedback loop",
    quote:
      "I scanned the QR code on the bag and instantly saw the exact farm in Nashik, harvest date, and lab safety certificate.",
    actor: "Everyday Household Consumer",
    location: "Point of Purchase / Kitchen Table",
    icon: "📱",
    story:
      "Using any standard smartphone camera, the consumer scans the GS1 QR code on the food package. They instantly view the farm origin, farmer payout, milling date, lab safety reports, and can submit verified sensory feedback directly back into the ecosystem.",
    keyActions: [
      "No-app required camera scan revealing complete 8-stage timeline",
      "Verification of 100% organic authenticity and zero pesticide residue",
      "Direct feedback & defect reporting that connects to origin mills",
    ],
    techProof:
      "GS1 Digital Link URI · Decentralized Web Reader · Consumer Feedback Loop",
    image: "/images/logineko/peru-pesticides-1000x604.jpg",
  },
];

export default function WeTrackPage() {
  const [activeStoryId, setActiveStoryId] = useState<string>(STORIES[0].id);
  const activeStory = STORIES.find((s) => s.id === activeStoryId) || STORIES[0];

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        {/* Page Hero Header */}
        <section className={styles.heroSection}>
          <div className="container">
            <div className={styles.heroTop}>
              <span className="eyebrow">THE COMPLETE SUPPLY CHAIN SAGA</span>
              <h1 className={styles.pageTitle}>
                We Track: <strong>The story of every stakeholder.</strong>
              </h1>
              <p className={styles.pageLead}>
                Traceability is not just lines of code — it is the connected
                journey of real farmers, millers, warehouse custodians, drivers,
                retailers, and consumers working in unified trust.
              </p>
            </div>

            {/* Continuous Traceability Flow Bar */}
            <div className={styles.flowStrip}>
              {STORIES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.flowNode} ${activeStoryId === s.id ? styles.flowNodeActive : ""}`}
                  onClick={() => setActiveStoryId(s.id)}
                >
                  <span className={styles.flowIcon}>{s.icon}</span>
                  <div className={styles.flowNodeText}>
                    <span className={styles.flowNodeNum}>{s.number}</span>
                    <span className={styles.flowNodeRole}>
                      {s.role.split("/")[0]}
                    </span>
                  </div>
                  {idx < STORIES.length - 1 && (
                    <span className={styles.flowArrow}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Stakeholder Narrative Showcase */}
        <section className={styles.storySection}>
          <div className="container">
            <div className={styles.storyCard}>
              {/* Left: Deep Story Content */}
              <div className={styles.storyContent}>
                <div className={styles.storyHeader}>
                  <div className={styles.badgeRow}>
                    <span className={styles.numberBadge}>
                      STAKEHOLDER {activeStory.number} OF 06
                    </span>
                    <span className="chip chip--green">
                      {activeStory.location}
                    </span>
                  </div>
                  <h2 className={styles.storyTitle}>{activeStory.role}</h2>
                  <p className={styles.storyTagline}>{activeStory.tagline}</p>
                </div>

                <blockquote className={styles.quoteBox}>
                  <p className={styles.quoteText}>
                    &ldquo;{activeStory.quote}&rdquo;
                  </p>
                  <cite className={styles.quoteAuthor}>
                    — {activeStory.actor}
                  </cite>
                </blockquote>

                <div className={styles.bodyBlock}>
                  <h4 className={styles.blockHeading}>
                    The Role in the Traceability Chain
                  </h4>
                  <p className={styles.narrativeText}>{activeStory.story}</p>
                </div>

                <div className={styles.actionsBlock}>
                  <h4 className={styles.blockHeading}>
                    Verifiable Key Actions Committed
                  </h4>
                  <ul className={styles.actionList}>
                    {activeStory.keyActions.map((act, idx) => (
                      <li key={idx} className={styles.actionItem}>
                        <span className={styles.check}>✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.techStrip}>
                  <span className={styles.techLabel}>CRYPTOGRAPHIC PROOF:</span>
                  <span className={styles.techVal}>
                    {activeStory.techProof}
                  </span>
                </div>
              </div>

              {/* Right: Editorial Visual */}
              <div className={styles.storyVisualWrap}>
                <div className={styles.imageCard}>
                  <img
                    src={activeStory.image}
                    alt={activeStory.role}
                    className={styles.storyImg}
                  />
                  <div className={styles.imageOverlay}>
                    <span className={styles.overlayIcon}>
                      {activeStory.icon}
                    </span>
                    <span className={styles.overlayActor}>
                      {activeStory.actor}
                    </span>
                  </div>
                </div>

                <div className={styles.navigationRow}>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      const currIdx = STORIES.findIndex(
                        (s) => s.id === activeStoryId,
                      );
                      const prevIdx =
                        (currIdx - 1 + STORIES.length) % STORIES.length;
                      setActiveStoryId(STORIES[prevIdx].id);
                    }}
                  >
                    ← Previous Stakeholder
                  </button>
                  <button
                    type="button"
                    className="btn btn--grass"
                    onClick={() => {
                      const currIdx = STORIES.findIndex(
                        (s) => s.id === activeStoryId,
                      );
                      const nextIdx = (currIdx + 1) % STORIES.length;
                      setActiveStoryId(STORIES[nextIdx].id);
                    }}
                  >
                    Next Stakeholder →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Card Overview Grid */}
        <section className={styles.gridSection}>
          <div className="container">
            <h3 className={styles.gridHeading}>
              All 6 Pillars of the FoodTrace Ecosystem
            </h3>
            <div className={styles.stakeholderGrid}>
              {STORIES.map((s) => (
                <div
                  key={s.id}
                  className={`${styles.miniCard} ${activeStoryId === s.id ? styles.miniCardActive : ""}`}
                  onClick={() => setActiveStoryId(s.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.miniCardTop}>
                    <span className={styles.miniIcon}>{s.icon}</span>
                    <span className={styles.miniNum}>{s.number}</span>
                  </div>
                  <h4 className={styles.miniTitle}>{s.role}</h4>
                  <p className={styles.miniDesc}>{s.tagline}</p>
                  <span className={styles.miniLink}>Explore Story →</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
