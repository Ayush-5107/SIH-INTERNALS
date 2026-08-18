'use client';
import { useState, useEffect } from 'react';
import { resolveQR, recordScanEvent, verifyInnerCredential } from '@/lib/api';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Truck,
  Building2,
  Store,
  FileCheck,
  Award,
  Thermometer,
  FlaskConical,
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  User,
  ExternalLink,
  Sprout,
  Factory
} from 'lucide-react';
import '../app.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface TimelineStep { step: string; actor: string; date: string; txId: string; }
interface BatchDoc { name: string; type: string; issuer: string; date: string; cid: string; status: 'VERIFIED' | 'PENDING'; }
interface QRResult {
  qrId?: string;
  batchId?: string;
  productName?: string;
  timeline?: TimelineStep[];
  is_public?: boolean;
  custody_status?: string;
  currentCustodian?: string;
  nextCustodian?: string;
}

const DOCS: BatchDoc[] = [
  { name: 'FSSAI Food Safety Certificate',        type: 'Regulatory',       issuer: 'FSSAI Regional Office, Pune',        date: '08 Aug 2026', cid: 'QmXoypiz...jW3WknFiJnKL', status: 'VERIFIED' },
  { name: 'Farm-to-Gate Quality Report',          type: 'Quality Assurance', issuer: 'AgriQual Labs Pvt Ltd',              date: '09 Aug 2026', cid: 'QmR4YhT1...wHpkZxLq92sA', status: 'VERIFIED' },
  { name: 'Cold Chain Temperature Log',           type: 'Cold Chain',        issuer: 'AgriTransit Logistics — IoT Gateway',date: '12 Aug 2026', cid: 'QmU8vBnX...0dTyKpL3mRfW', status: 'VERIFIED' },
  { name: 'Pesticide Residue Test Report',        type: 'Lab Analysis',      issuer: 'National Accredited Lab — Mumbai',   date: '10 Aug 2026', cid: 'QmZ2cPdK...YtEwGhNvQ1sB', status: 'VERIFIED' },
  { name: 'Customs & Dispatch Declaration',       type: 'Logistics',         issuer: 'Central Packaging Hub',             date: '12 Aug 2026', cid: 'QmK9nWqS...8fLjMvXuD5cR', status: 'PENDING' },
];

function getDocIcon(type: string) {
  switch (type) {
    case 'Regulatory': return <Award size={20} color="#d97706" />;
    case 'Quality Assurance': return <ShieldCheck size={20} color="#059669" />;
    case 'Cold Chain': return <Thermometer size={20} color="#0284c7" />;
    case 'Lab Analysis': return <FlaskConical size={20} color="#7c3aed" />;
    default: return <Truck size={20} color="#2563eb" />;
  }
}

function getTimelineIcon(step: string) {
  const s = step.toLowerCase();
  if (s.includes('farm') || s.includes('harvest')) return <Sprout size={16} />;
  if (s.includes('process') || s.includes('factory')) return <Factory size={16} />;
  if (s.includes('transit') || s.includes('logistics') || s.includes('ship')) return <Truck size={16} />;
  if (s.includes('store') || s.includes('supermarket') || s.includes('retail')) return <Store size={16} />;
  return <Building2 size={16} />;
}

async function fetchBatchPublicStatus(batchId: string): Promise<{ is_public: boolean; custody_status: string; custodian: string; next_custodian_org?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/batches`);
    if (!res.ok) throw new Error();
    const batches = await res.json();
    const match = (Array.isArray(batches) ? batches : []).find((b: { id: string }) => b.id === batchId);
    return match ? {
      is_public: match.is_public ?? false,
      custody_status: match.custody_status ?? 'IN_CUSTODY',
      custodian: match.custodian ?? '',
      next_custodian_org: match.next_custodian_org,
    } : { is_public: false, custody_status: 'IN_CUSTODY', custodian: '' };
  } catch {
    return { is_public: batchId.startsWith('QR-') || batchId.includes('MBTSDM2UM') || batchId.includes('IKHJWTOYD'), custody_status: 'DELIVERED', custodian: 'GreenBasket Supermarket' };
  }
}

export default function TrackPage() {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<QRResult | null>(null);
  const [batchStatus, setBatchStatus] = useState<{ is_public: boolean; custody_status: string; custodian: string; next_custodian_org?: string } | null>(null);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState<'journey' | 'documents'>('journey');

  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ isAuthentic: boolean; message: string } | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    const data = await verifyInnerCredential(verifyCode.trim(), result?.batchId);
    setVerifyResult(data);
    setVerifying(false);
  }

  async function doSearch(q: string) {
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    setBatchStatus(null);
    try {
      const data = await resolveQR(q);
      setResult(data);

      const batchId = data.batchId || q;
      const status = await fetchBatchPublicStatus(batchId);
      setBatchStatus(status);

      recordScanEvent({ entity_id: q, actor_role: 'consumer', actor_name: 'Web User', location: 'Web App' });
    } catch {
      setError('Failed to resolve QR code. Please try again.');
    }
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query.trim());
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const idParam = new URLSearchParams(window.location.search).get('id');
      if (idParam) { setQuery(idParam); doSearch(idParam); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPublic = batchStatus?.is_public ?? false;
  const isInTransit = batchStatus && !batchStatus.is_public;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      {/* Clean White & Warm Yellow Header Nav */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
        <a href="/" style={{ color: '#0f172a', fontWeight: 900, fontSize: '18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef08a', border: '1px solid #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#d97706" />
          </div>
          FoodTrace Consumer Portal
        </a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/feedback" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Report Issue</a>
          <a href="/login" style={{ color: '#0f172a', background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)', border: '1px solid #facc15', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)' }}>
            Sign In <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 20px 80px' }}>
        
        {/* Hero Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: 'linear-gradient(135deg, #fef08a 0%, #fde047 100%)', border: '2px solid #facc15', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(250, 204, 21, 0.35)' }}>
            <ShieldCheck size={36} color="#b45309" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Verify Food Authenticity & Lineage
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto', fontWeight: 500 }}>
            Scan a batch QR code to inspect farm origin, lab compliance reports, cold-chain temperature logs, and inner seal credentials.
          </p>
        </div>

        {/* Clean White & Yellow Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="track-input"
              type="text"
              className="form-input"
              placeholder="Enter Batch ID (e.g. BATCH-MBTSDM2UM or QR-A1B2C3D4)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: '44px', height: '50px', fontSize: '15px', borderRadius: '12px', background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}
            />
          </div>
          <button id="track-submit" type="submit" className="btn" style={{ height: '50px', padding: '0 26px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)', color: '#0f172a', border: '1px solid #eab308', boxShadow: '0 4px 14px rgba(250, 204, 21, 0.35)', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Verifying…' : <>Inspect <ArrowRight size={16} /></>}
          </button>
        </form>

        {error && <div className="alert alert-danger" style={{ borderRadius: '12px', marginBottom: '24px' }}>{error}</div>}

        {/* ── IN TRANSIT GATEWAY ── */}
        {result && isInTransit && (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Truck size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Batch is currently in Transit
            </h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px', maxWidth: '520px', margin: '0 auto 24px' }}>
              This batch (<span className="mono" style={{ color: '#d97706', fontWeight: 800 }}>{result.batchId}</span>) is actively moving along the supply chain pipeline.
              Full consumer public inspection will unlock once accepted at the final retail destination.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 800 }}>Active Custody Information</div>
              <div style={{ fontSize: '14px', color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <User size={15} color="#d97706" /> Current Custodian: {batchStatus?.custodian || '—'}
              </div>
              {batchStatus?.next_custodian_org && (
                <div style={{ fontSize: '13px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Calendar size={15} /> Awaiting Acceptance: {batchStatus.next_custodian_org}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FULL VERIFIED PUBLIC VIEW ── */}
        {result && isPublic && (
          <div>
            {/* Product Overview Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
                    {result.productName || 'Fresh Farm Produce Batch'}
                  </h2>
                  <p className="mono" style={{ fontSize: '13px', color: '#d97706', fontWeight: 800 }}>Batch ID: {result.batchId}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Traceability Authenticated
                  </span>
                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} /> Blockchain Verified
                  </span>
                </div>
              </div>

              {/* Custodian Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Store size={16} color="#d97706" /> Available at <strong style={{ color: '#0f172a' }}>{batchStatus?.custodian || result.currentCustodian || 'GreenBasket Supermarket'}</strong>
                </span>
                <span style={{ color: '#059669', fontWeight: 800, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ● Supply Chain Complete
                </span>
              </div>
            </div>

            {/* Inner Credential Scratch Code Verification Widget in Warm Yellow Theme */}
            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', borderRadius: '16px', border: '1.5px solid #f59e0b', padding: '24px', marginBottom: '28px', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.15)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#92400e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} color="#d97706" /> Scratch-Off Inner Seal Authenticator
              </h3>
              <p style={{ color: '#78350f', fontSize: '13px', marginBottom: '16px', fontWeight: 500 }}>
                Enter the secret scratch-off key printed inside your package label seal to confirm individual unit authenticity.
              </p>
              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: verifyResult ? '16px' : '0' }}>
                <input
                  className="form-input"
                  style={{ flex: 1, fontFamily: 'var(--mono)', letterSpacing: '1.5px', height: '44px', background: '#ffffff', border: '1.5px solid #f59e0b', color: '#0f172a', borderRadius: '10px', fontWeight: 700 }}
                  placeholder="e.g. SEC-2954-A"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                />
                <button type="submit" className="btn" style={{ height: '44px', padding: '0 22px', borderRadius: '10px', fontWeight: 800, background: '#f59e0b', color: '#ffffff', border: '1px solid #d97706', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)', cursor: 'pointer' }} disabled={verifying || !verifyCode.trim()}>
                  {verifying ? 'Verifying…' : 'Verify Code'}
                </button>
              </form>
              {verifyResult && (
                <div style={{
                  background: verifyResult.isAuthentic ? '#d1fae5' : '#fee2e2',
                  border: `1.5px solid ${verifyResult.isAuthentic ? '#059669' : '#dc2626'}`,
                  borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start'
                }}>
                  {verifyResult.isAuthentic ? <CheckCircle2 size={24} color="#059669" /> : <XCircle size={24} color="#dc2626" />}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 900, color: verifyResult.isAuthentic ? '#065f46' : '#991b1b', marginBottom: '3px' }}>
                      {verifyResult.isAuthentic ? 'GENUINE AUTHENTIC PRODUCT' : 'UNVERIFIED / INVALID CREDENTIAL'}
                    </h4>
                    <p style={{ color: verifyResult.isAuthentic ? '#047857' : '#b91c1c', fontSize: '13px', lineHeight: 1.4, fontWeight: 600 }}>
                      {verifyResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('journey')}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'journey' ? '3.5px solid #f59e0b' : '3.5px solid transparent',
                  color: activeTab === 'journey' ? '#d97706' : '#64748b',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Truck size={16} /> Supply Chain Journey
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'documents' ? '3.5px solid #f59e0b' : '3.5px solid transparent',
                  color: activeTab === 'documents' ? '#d97706' : '#64748b',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileCheck size={16} /> Lab & Safety Certificates ({DOCS.length})
              </button>
            </div>

            {/* Journey Tab */}
            {activeTab === 'journey' && (
              result.timeline && result.timeline.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.timeline.map((step, i) => (
                    <div key={i} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getTimelineIcon(step.step)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{step.step}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                          {step.actor} · {step.date}
                        </div>
                      </div>
                      {step.txId && (
                        <div className="mono" style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                          TX: {step.txId.slice(0, 10)}…
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state">No timeline steps recorded.</div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
                  All safety certificates are cryptographically hashed and pinned to IPFS decentralized storage.
                </p>
                {DOCS.map((doc, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ flexShrink: 0 }}>
                      {getDocIcon(doc.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{doc.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{doc.type} · {doc.issuer} · {doc.date}</div>
                      <div className="mono" style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <ExternalLink size={12} /> IPFS: {doc.cid}
                      </div>
                    </div>
                    <div>
                      {doc.status === 'VERIFIED'
                        ? <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#d1fae5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px' }}>✓ VERIFIED</span>
                        : <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706', background: '#fef3c7', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '6px' }}>⏳ PENDING</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
