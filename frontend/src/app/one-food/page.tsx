"use client";
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

interface GalleryItem {
  id: string;
  category: string;
  title: string;
  src: string;
  timestamp: string;
  device: string;
  hash: string;
  description: string;
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "harvest",
    category: "Farm Origin",
    title: "Plot Harvest & Field Sowing",
    src: "/images/logineko/field-operations-at-logineko-768x432.jpg",
    timestamp: "2026-08-10 06:45 IST",
    device: "Field Drone DJI Mavic 3M (Multispectral)",
    hash: "0x88f2...91ab42",
    description:
      "Nashik Cluster N-402 geofenced organic wheat harvest. Soil moisture recorded at 11.8%.",
  },
  {
    id: "milling",
    category: "Processing & Sortex",
    title: "Sortex Optical Cleaning Facility",
    src: "/images/logineko/farming-software-maps-solution.jpg",
    timestamp: "2026-08-11 10:15 IST",
    device: "Sortex Vision Pro Camera Node #04",
    hash: "0x44cd...0911fe",
    description:
      "Pneumatic de-stoning and optical grain classification yielding 99.92% defect-free purity.",
  },
  {
    id: "packaging",
    category: "Packaging & Logistics",
    title: "Automated Nitrogen-Flushed Packaging",
    src: "/images/logineko/team-at-logineko-farm.jpg",
    timestamp: "2026-08-12 11:30 IST",
    device: "Line #02 High-Speed Packager",
    hash: "0x12bb...8849aa",
    description:
      "Nitrogen-sealed 5KG consumer packs with serialized GS1 Digital Link dynamic QR codes.",
  },
  {
    id: "lab_cert",
    category: "Lab Verification",
    title: "FSSAI NABL Laboratory Certificate",
    src: "/images/logineko/soil-preservation-at-logineko.webp",
    timestamp: "2026-08-11 16:30 IST",
    device: "Eurofins Spectrophotometer Lab Node",
    hash: "0x77ee...ff2201",
    description:
      "Certified 0.00 PPM chemical residues and 13.4% premium gluten protein verified.",
  },
];

export default function OneFoodPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activeItemId, setActiveItemId] = useState<string>(
    INITIAL_GALLERY[0].id,
  );
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [selectedCrop, setSelectedCrop] = useState<string>("Wheat");
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItem = gallery.find((g) => g.id === activeItemId) || gallery[0];

  // Handle image replacement via file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setGallery((prev) =>
      prev.map((item) =>
        item.id === activeItemId
          ? {
              ...item,
              src: objectUrl,
              title: `${item.title} (Updated)`,
              hash: `0x${Math.random().toString(16).substring(2, 8)}...custom`,
              timestamp: new Date().toLocaleString(),
            }
          : item,
      ),
    );
    setUploadNotice(
      `✓ Successfully updated ${activeItem.category} image with "${file.name}"`,
    );
    setTimeout(() => setUploadNotice(null), 4000);
  };

  // Reset to default sample images
  const handleResetImages = () => {
    setGallery(INITIAL_GALLERY);
    setUploadNotice("↺ Reset all image slots to verified on-chain defaults.");
    setTimeout(() => setUploadNotice(null), 3000);
  };

  // Clear active image (empty state demo)
  const handleClearActiveImage = () => {
    setGallery((prev) =>
      prev.map((item) =>
        item.id === activeItemId ? { ...item, src: "" } : item,
      ),
    );
    setUploadNotice(
      `Cleared image for ${activeItem.category}. Empty state rendered.`,
    );
    setTimeout(() => setUploadNotice(null), 3000);
  };

  return (
    <div className={styles.pageWrap}>
      <Navbar />

      <main className={styles.main}>
        {/* Page Hero Header */}
        <section className={styles.heroSection}>
          <div className="container">
            <div className={styles.heroTop}>
              <div className={styles.badgeRow}>
                <span className="chip chip--green">
                  ● VERIFIED GENESIS BATCH
                </span>
                <span className={styles.batchTag}>ID: WF-2026-0815</span>
              </div>
              <h1 className={styles.pageTitle}>
                Single Product Provenance Explorer:{" "}
                <strong>Organic Sharbati Wheat Flour</strong>
              </h1>
              <p className={styles.pageLead}>
                Inspect photographic evidence, laboratory certificates, and
                cryptographic sensor logs committed across each handover stage
                for Batch <strong>WF-2026-0815</strong>.
              </p>
            </div>

            {/* Quick Crop Selector Pills */}
            <div className={styles.cropSelector}>
              <span className={styles.cropSelectorLabel}>
                SWITCH PRODUCT DEMO:
              </span>
              {[
                "Wheat",
                "Oats",
                "Peas",
                "Chickpeas",
                "Sunflower",
                "Flaxseed",
              ].map((crop) => (
                <button
                  key={crop}
                  type="button"
                  className={`${styles.cropBtn} ${selectedCrop === crop ? styles.cropBtnActive : ""}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Evidence & Image Management Workspace */}
        <section className={styles.workspaceSection}>
          <div className="container">
            <div className={styles.workspaceGrid}>
              {/* Left Column: Image Category Switcher + Unified Action Controls */}
              <div className={styles.controlPanel}>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>
                    Supply Chain Visual Assets
                  </h3>
                  <span className={styles.panelSub}>4 Verifiable Stages</span>
                </div>

                <div className={styles.slotList}>
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.slotCard} ${activeItemId === item.id ? styles.slotCardActive : ""}`}
                      onClick={() => setActiveItemId(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.slotThumbWrap}>
                        {item.src ? (
                          <img
                            src={item.src}
                            alt={item.title}
                            className={styles.slotThumb}
                          />
                        ) : (
                          <div className={styles.emptyThumb}>No Image</div>
                        )}
                      </div>
                      <div className={styles.slotInfo}>
                        <span className={styles.slotCat}>{item.category}</span>
                        <h4 className={styles.slotTitle}>{item.title}</h4>
                        <span className={styles.slotTime}>
                          {item.timestamp}
                        </span>
                      </div>
                      <span className={styles.slotArrow}>→</span>
                    </div>
                  ))}
                </div>

                {/* Unified Image Action Controls */}
                <div className={styles.actionBox}>
                  <span className={styles.actionBoxLabel}>
                    EVIDENCE MEDIA CONTROLS
                  </span>
                  <div className={styles.buttonStack}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      className="btn btn--grass"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📷 Replace / Upload {activeItem.category} Image
                    </button>

                    <div className={styles.dualBtnRow}>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        onClick={() => setPreviewModalOpen(true)}
                        disabled={!activeItem.src}
                      >
                        🔍 Fullscreen
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        onClick={handleClearActiveImage}
                      >
                        🗑️ Clear Slot
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn--oat"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        fontSize: "12px",
                      }}
                      onClick={handleResetImages}
                    >
                      ↺ Restore Default Ledger Images
                    </button>
                  </div>

                  {uploadNotice && (
                    <div className={styles.toastNotice}>{uploadNotice}</div>
                  )}
                </div>
              </div>

              {/* Right Column: High-Resolution Active Specimen Preview */}
              <div className={styles.previewPanel}>
                <div className={styles.previewCard}>
                  <div className={styles.previewHeader}>
                    <div>
                      <span className={styles.previewCategory}>
                        {activeItem.category}
                      </span>
                      <h2 className={styles.previewTitle}>
                        {activeItem.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="btn btn--outline"
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                      onClick={() => setPreviewModalOpen(true)}
                      disabled={!activeItem.src}
                    >
                      Inspect HD Metadata
                    </button>
                  </div>

                  {/* Visual Display / Empty State */}
                  <div className={styles.mediaContainer}>
                    {activeItem.src ? (
                      <img
                        src={activeItem.src}
                        alt={activeItem.title}
                        className={styles.mainMedia}
                        onClick={() => setPreviewModalOpen(true)}
                      />
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📷</div>
                        <h4 className={styles.emptyTitle}>
                          No image uploaded for {activeItem.category}
                        </h4>
                        <p className={styles.emptyDesc}>
                          Click the &ldquo;Upload Image&rdquo; button on the
                          left to attach verified photographic proof.
                        </p>
                        <button
                          type="button"
                          className="btn btn--grass"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Photo Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata Audit Strip */}
                  <div className={styles.metadataGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaKey}>
                        CAPTURED TIMESTAMP:
                      </span>
                      <span className={styles.metaVal}>
                        {activeItem.timestamp}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaKey}>HARDWARE / DEVICE:</span>
                      <span className={styles.metaVal}>
                        {activeItem.device}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaKey}>IPFS CONTENT HASH:</span>
                      <code className={styles.metaCode}>{activeItem.hash}</code>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaKey}>
                        VERIFICATION SUMMARY:
                      </span>
                      <span className={styles.metaVal}>
                        {activeItem.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Laboratory & Origin Credentials Card */}
        <section className={styles.specsSection}>
          <div className="container">
            <div className={styles.specsCard}>
              <h3 className={styles.specsTitle}>
                Verified Laboratory Analysis &amp; Origin Metrics
              </h3>
              <div className={styles.specsGrid}>
                <div className={styles.specBox}>
                  <span className={styles.specKey}>
                    Pesticide Residue Screen
                  </span>
                  <span
                    className={styles.specVal}
                    style={{ color: "var(--color-grass-500)" }}
                  >
                    0.00 PPM (100% Organic)
                  </span>
                  <span className={styles.specSub}>
                    Tested against 180 Organophosphates
                  </span>
                </div>
                <div className={styles.specBox}>
                  <span className={styles.specKey}>Moisture Content</span>
                  <span className={styles.specVal}>11.8% Standard</span>
                  <span className={styles.specSub}>
                    Safe storage moisture &lt; 12.5%
                  </span>
                </div>
                <div className={styles.specBox}>
                  <span className={styles.specKey}>Sortex Optical Purity</span>
                  <span
                    className={styles.specVal}
                    style={{ color: "var(--color-grass-500)" }}
                  >
                    99.92% Clean
                  </span>
                  <span className={styles.specSub}>
                    Triple-stage laser sortex
                  </span>
                </div>
                <div className={styles.specBox}>
                  <span className={styles.specKey}>Farmer Revenue Share</span>
                  <span
                    className={styles.specVal}
                    style={{ color: "var(--color-grass-500)" }}
                  >
                    72.4% Direct Payout
                  </span>
                  <span className={styles.specSub}>
                    Smart contract escrow settled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Fullscreen HD Image Modal */}
      {previewModalOpen && activeItem.src && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>{activeItem.title}</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPreviewModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <img
              src={activeItem.src}
              alt={activeItem.title}
              className={styles.modalImg}
            />
            <div className={styles.modalFoot}>
              <span>Timestamp: {activeItem.timestamp}</span>
              <code>Hash: {activeItem.hash}</code>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
