"use client";
import { useState } from "react";
import styles from "./ProductWorkflow.module.css";

interface WorkflowStage {
  id: string;
  stepNumber: string;
  name: string;
  role: string;
  stakeholder: string;
  stakeholderDid: string;
  location: string;
  timestamp: string;
  batchId: string;
  status: "Completed" | "In-Transit" | "Verified" | "Active";
  statusColor: "green" | "blue" | "amber";
  qualityMetrics: { label: string; value: string; pass: boolean }[];
  verificationHash: string;
  prevStage: string;
  nextStage: string;
  actionDetails: string;
  icon: string;
}

const STAGES: WorkflowStage[] = [
  {
    id: "farmer",
    stepNumber: "01",
    name: "Farmer Origin & Harvest",
    role: "Origin Producer",
    stakeholder: "Ramesh Patil (Organic Cluster #402)",
    stakeholderDid: "did:fabric:farmer:mh-nsk-4029",
    location: "Nashik Organic Valley, Maharashtra (20.0110° N, 73.7903° E)",
    timestamp: "2026-08-10 06:30 IST",
    batchId: "LOT-NSK-2026-W402",
    status: "Completed",
    statusColor: "green",
    qualityMetrics: [
      { label: "Moisture Level", value: "11.8% (Optimal <12%)", pass: true },
      {
        label: "Chemical Residue",
        value: "0.00 PPM (100% Organic)",
        pass: true,
      },
      { label: "Geo-Fence Hash", value: "VERIFIED_POLYGON_STAMP", pass: true },
    ],
    verificationHash: "0x8f2a...91d4e2",
    prevStage: "Soil & Seed Registration",
    nextStage: "APMC Collection Center",
    actionDetails:
      "Harvested 12,500 KG Sharbati Wheat. Harvest telemetry signed with W3C DID private key and minted as parent asset on Hyperledger ledger.",
    icon: "🌾",
  },
  {
    id: "collection",
    stepNumber: "02",
    name: "APMC Collection Hub",
    role: "Aggregation & Weighment",
    stakeholder: "Nashik District APMC Aggregators",
    stakeholderDid: "did:fabric:apmc:nsk-hub-01",
    location: "APMC Yard #3, Nashik Mandi",
    timestamp: "2026-08-10 14:15 IST",
    batchId: "AGG-NSK-8831",
    status: "Completed",
    statusColor: "green",
    qualityMetrics: [
      { label: "Weight Audited", value: "12,480 KG Gross", pass: true },
      { label: "Foreign Matter", value: "0.4% (Grade A Standard)", pass: true },
      {
        label: "Weighbridge Certificate",
        value: "ELECTRONIC_SEAL_VALID",
        pass: true,
      },
    ],
    verificationHash: "0x3c11...7a4f90",
    prevStage: "Farmer Origin & Harvest",
    nextStage: "Sortex Milling & Processing",
    actionDetails:
      "Mandate digital weighment reconciliation against farmer manifest. Dispatched via dedicated sealed trailer to Pune processing facility.",
    icon: "🏢",
  },
  {
    id: "processing",
    stepNumber: "03",
    name: "Sortex Milling & Cleaning",
    role: "Processor / Miller",
    stakeholder: "Sahyadri Agro Processing Mill #04",
    stakeholderDid: "did:fabric:processor:pune-mill-04",
    location: "Chakan Industrial Corridor, Pune",
    timestamp: "2026-08-11 09:45 IST",
    batchId: "PROC-PUN-0914-A",
    status: "Completed",
    statusColor: "green",
    qualityMetrics: [
      {
        label: "Optical Sortex Purity",
        value: "99.92% Defect-Free",
        pass: true,
      },
      { label: "Granulation Mesh", value: "Uniform 250 Micron", pass: true },
      { label: "Milling Loss", value: "3.1% (Within Tolerance)", pass: true },
    ],
    verificationHash: "0x6e9b...2817cc",
    prevStage: "APMC Collection Hub",
    nextStage: "Lab Quality & Food Safety",
    actionDetails:
      "Multi-stage Sortex optical separation and pneumatic de-stoning. Lineage transformation linked parent LOT-NSK-2026-W402 to output batch PROC-PUN-0914-A.",
    icon: "⚙️",
  },
  {
    id: "quality",
    stepNumber: "04",
    name: "Lab Quality & Safety Check",
    role: "Accredited Testing Lab",
    stakeholder: "FSSAI Certified Eurofins QA Lab",
    stakeholderDid: "did:fabric:lab:fssai-cert-982",
    location: "Bhosari Analytical Center, Pune",
    timestamp: "2026-08-11 16:20 IST",
    batchId: "LAB-CERT-88491",
    status: "Verified",
    statusColor: "green",
    qualityMetrics: [
      { label: "Heavy Metals (Pb, Cd)", value: "Non-Detectable", pass: true },
      { label: "Gluten Protein Content", value: "13.4% Premium", pass: true },
      { label: "NABL Certificate", value: "NABL/2026/FSSAI-0815", pass: true },
    ],
    verificationHash: "0x4d55...b012ee",
    prevStage: "Sortex Milling & Cleaning",
    nextStage: "Automated Packaging & Warehouse",
    actionDetails:
      "Comprehensive microbiological culture and spectrographic pesticide screening. Digital COA (Certificate of Analysis) uploaded with IPFS hash.",
    icon: "🔬",
  },
  {
    id: "warehouse",
    stepNumber: "05",
    name: "Smart Storage & Packaging",
    role: "Warehouse Custodian",
    stakeholder: "Central Cold Storage & Packaging Hub",
    stakeholderDid: "did:fabric:warehouse:pune-wh-02",
    location: "Tathawade Logistics Hub, Pune",
    timestamp: "2026-08-12 11:00 IST",
    batchId: "WF-2026-0815",
    status: "Completed",
    statusColor: "green",
    qualityMetrics: [
      { label: "Silo Temperature", value: "18.2°C (Optimal)", pass: true },
      { label: "Relative Humidity", value: "54% Non-Condensing", pass: true },
      {
        label: "Dual-QR Generation",
        value: "4,280 Unique Item Serialized",
        pass: true,
      },
    ],
    verificationHash: "0x1a88...ff44aa",
    prevStage: "Lab Quality & Safety Check",
    nextStage: "Cold-Chain Freight & Logistics",
    actionDetails:
      "Automated nitrogen-flushed packaging into 1KG and 5KG consumer packs. Dual-QR tamper codes minted with GS1 Digital Link URIs.",
    icon: "📦",
  },
  {
    id: "distributor",
    stepNumber: "06",
    name: "Cold-Chain Freight & Logistics",
    role: "Logistics Transporter",
    stakeholder: "AgriTransit Fleet Logistics",
    stakeholderDid: "did:fabric:logistics:truck-mh12-8801",
    location: "Mumbai-Pune Expressway Corridor",
    timestamp: "2026-08-13 04:30 IST",
    batchId: "SHIP-PUN-BOM-102",
    status: "Completed",
    statusColor: "green",
    qualityMetrics: [
      { label: "Reefer Temp Average", value: "19.4°C (Safe Band)", pass: true },
      {
        label: "Route GPS Compliance",
        value: "Zero Geofence Deviation",
        pass: true,
      },
      {
        label: "E-Way Bill Signature",
        value: "GST-EWAY-2026-9021",
        pass: true,
      },
    ],
    verificationHash: "0x99dd...01bc55",
    prevStage: "Smart Storage & Packaging",
    nextStage: "Retail Supermarket POS",
    actionDetails:
      "Continuous IoT Bluetooth BLE sensor streaming telemetry every 5 minutes. No thermal shock or seal breakage recorded during 148 km journey.",
    icon: "🚚",
  },
  {
    id: "retailer",
    stepNumber: "07",
    name: "Retail Supermarket POS",
    role: "Point of Sale Retailer",
    stakeholder: "GreenBasket Hypermarket Bandra",
    stakeholderDid: "did:fabric:retailer:gb-mum-08",
    location: "Bandra West, Mumbai (19.0596° N, 72.8295° E)",
    timestamp: "2026-08-13 14:00 IST",
    batchId: "RETAIL-GB-MUM-881",
    status: "Active",
    statusColor: "blue",
    qualityMetrics: [
      {
        label: "Carton Seal Audit",
        value: "Intact Cryptographic Seal",
        pass: true,
      },
      {
        label: "Shelf Stocking Date",
        value: "2026-08-13 (Fresh Pack)",
        pass: true,
      },
      {
        label: "POS Terminal Sync",
        value: "Fabric Peer Node Verified",
        pass: true,
      },
    ],
    verificationHash: "0x22ee...8831ba",
    prevStage: "Cold-Chain Freight & Logistics",
    nextStage: "Consumer QR Verification",
    actionDetails:
      "Inbound scanning automated at receiving dock. Barcode linked directly to store inventory system with immediate POS lock capability on alert.",
    icon: "🏬",
  },
  {
    id: "consumer",
    stepNumber: "08",
    name: "Consumer QR Verification",
    role: "End Consumer",
    stakeholder: "Consumer Mobile Scanner (Web App)",
    stakeholderDid: "did:fabric:consumer:anonymous-scan",
    location: "Mumbai Suburban Area (Consumer Device)",
    timestamp: "2026-08-14 18:22 IST",
    batchId: "WF-2026-0815 // Item #0482",
    status: "Verified",
    statusColor: "green",
    qualityMetrics: [
      {
        label: "QR Scan Validation",
        value: "Genuine & Authentic (1st Scan)",
        pass: true,
      },
      {
        label: "Farm Origin Certified",
        value: "100% Organic Nashik Wheat",
        pass: true,
      },
      { label: "Consumer Feedback", value: "Feedback Loop Active", pass: true },
    ],
    verificationHash: "0x77aa...1122ef",
    prevStage: "Retail Supermarket POS",
    nextStage: "Closed Loop / Continuous Quality Feedback",
    actionDetails:
      "Consumer scans GS1 Digital Link QR on packaging. Full 8-stage provenance timeline, farmer payout, and feedback submission interface presented.",
    icon: "📱",
  },
];

export default function ProductWorkflow() {
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(STAGES[0]);

  return (
    <section className={styles.section} id="workflow">
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className="eyebrow">LIVE OPERATIONAL DASHBOARD</span>
            <h2 className={styles.title}>
              Real-time journey of <strong>one verified product</strong>.
            </h2>
          </div>
          <p className={styles.lead}>
            Follow the live cryptographic custody trail of Batch{" "}
            <strong>WF-2026-0815</strong> (Sharbati Organic Wheat) across all 8
            supply chain nodes in real time.
          </p>
        </div>

        {/* 8-Stage Interactive Node Bar */}
        <div className={styles.timelineBarWrap}>
          <div className={styles.timelineBar}>
            {STAGES.map((st, idx) => {
              const isSelected = selectedStage.id === st.id;
              return (
                <div
                  key={st.id}
                  className={`${styles.nodeItem} ${isSelected ? styles.nodeItemSelected : ""}`}
                  onClick={() => setSelectedStage(st)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.nodeIconCircle}>
                    <span className={styles.nodeEmoji}>{st.icon}</span>
                    <span className={styles.nodeStepNum}>{st.stepNumber}</span>
                  </div>
                  <div className={styles.nodeText}>
                    <span className={styles.nodeName}>
                      {st.name.split("&")[0]}
                    </span>
                    <span className={styles.nodeRole}>{st.role}</span>
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className={styles.nodeConnector} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Operational Stage Detail Card */}
        <div className={styles.dashboardCard}>
          {/* Card Top Strip */}
          <div className={styles.dashHeader}>
            <div className={styles.dashHeaderLeft}>
              <div className={styles.stageNumberBadge}>
                STAGE {selectedStage.stepNumber} OF 08
              </div>
              <h3 className={styles.dashTitle}>
                <span className={styles.dashEmoji}>{selectedStage.icon}</span>{" "}
                {selectedStage.name}
              </h3>
            </div>
            <div className={styles.statusGroup}>
              <span className={`chip chip--${selectedStage.statusColor}`}>
                ● {selectedStage.status.toUpperCase()}
              </span>
              <span className={styles.batchPill}>
                BATCH: <strong>{selectedStage.batchId}</strong>
              </span>
            </div>
          </div>

          {/* Card Body Grid: 2 Columns */}
          <div className={styles.dashGrid}>
            {/* Left: Custody & Location Details */}
            <div className={styles.infoCol}>
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>
                  STAKEHOLDER &amp; IDENTITY
                </span>
                <span className={styles.infoValueMain}>
                  {selectedStage.stakeholder}
                </span>
                <span className={styles.didBadge}>
                  {selectedStage.stakeholderDid}
                </span>
              </div>

              <div className={styles.twoColRow}>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>LOCATION / GPS</span>
                  <span className={styles.infoValue}>
                    {selectedStage.location}
                  </span>
                </div>
                <div className={styles.infoBlock}>
                  <span className={styles.infoLabel}>TIMESTAMP (UTC/IST)</span>
                  <span className={styles.infoValue}>
                    {selectedStage.timestamp}
                  </span>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>
                  OPERATIONAL ACTION RECORDED
                </span>
                <p className={styles.actionText}>
                  {selectedStage.actionDetails}
                </p>
              </div>

              {/* Previous & Next Breadcrumbs */}
              <div className={styles.navigationStrip}>
                <div className={styles.navBlock}>
                  <span className={styles.navBlockLabel}>← PREVIOUS STAGE</span>
                  <span className={styles.navBlockVal}>
                    {selectedStage.prevStage}
                  </span>
                </div>
                <div className={styles.navBlock} style={{ textAlign: "right" }}>
                  <span className={styles.navBlockLabel}>NEXT STAGE →</span>
                  <span className={styles.navBlockVal}>
                    {selectedStage.nextStage}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quality Check & Cryptographic Proof */}
            <div className={styles.auditCol}>
              <span className={styles.infoLabel}>
                QUALITY / VERIFICATION PARAMETERS
              </span>
              <div className={styles.qualityList}>
                {selectedStage.qualityMetrics.map((q, idx) => (
                  <div key={idx} className={styles.qualityRow}>
                    <div className={styles.qualityLeft}>
                      <span className={styles.checkIcon}>✓</span>
                      <span className={styles.qualityKey}>{q.label}</span>
                    </div>
                    <span className={styles.qualityVal}>{q.value}</span>
                  </div>
                ))}
              </div>

              <div className={styles.proofCard}>
                <div className={styles.proofHeader}>
                  <span className={styles.proofLabel}>
                    ON-CHAIN VERIFICATION PROOF
                  </span>
                  <span className={styles.proofBadge}>
                    FABRIC BLOCK #18,402
                  </span>
                </div>
                <div className={styles.proofHashRow}>
                  <span className={styles.hashLabel}>TX HASH:</span>
                  <code className={styles.hashCode}>
                    {selectedStage.verificationHash}
                  </code>
                </div>
                <p className={styles.proofNotice}>
                  Cryptographically sealed with ECDSA secp256k1 signature and
                  verified by multi-organization consensus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
