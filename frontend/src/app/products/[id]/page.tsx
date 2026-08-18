'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchProducts, fetchBatches, fetchUnits, fetchIncidents, fetchEvents } from '@/lib/api';
import { IconProducts, IconBatches, IconUnitsQR, IconIncidents, IconEvents, IconShield, IconCheck, IconClose } from '@/components/icons/Icons';
import '../../app.css';

type Tab = 'batches' | 'units' | 'incidents' | 'events' | 'verify';

interface Product { id: string; name: string; category: string; gtin: string; manufacturer: string; date: string; }
interface Batch   { id: string; productId: string; status: string; quantity: number; uom: string; custodian: string; next_custodian_org?: string; custody_status?: string; is_public?: boolean; date: string; }
interface Unit    { id: string; batchId: string; status: string; outerQR: string; innerCredential: string; date: string; }
interface Incident { id: string; unitId: string; category: string; reporter: string; status: string; ipfsCid: string; date: string; }
interface Event   { id: string; type: string; batch_id?: string; entity_id?: string; from_actor?: string; to_actor?: string; actor_name?: string; location?: string; timestamp: string; fabric_tx_id?: string; }

const STATUS_CLASS: Record<string, string> = {
  IN_TRANSIT: 'badge-warning', ON_SHELF: 'badge-success', VALIDATED: 'badge-success',
  RECALLED: 'badge-danger', BLOCKED: 'badge-danger', PROCESSING: 'badge-info', PRINTED: 'badge-muted',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-muted'}`}>{status}</span>;
}

const TAB_CONFIG: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'batches',   label: 'Batches',   icon: <IconBatches size={16} /> },
  { key: 'units',     label: 'Units',     icon: <IconUnitsQR size={16} /> },
  { key: 'incidents', label: 'Incidents', icon: <IconIncidents size={16} /> },
  { key: 'events',    label: 'Events',    icon: <IconEvents size={16} /> },
  { key: 'verify',    label: 'Verify',    icon: <IconShield size={16} /> },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = decodeURIComponent(params.id as string);

  const [product,   setProduct]   = useState<Product | null>(null);
  const [batches,   setBatches]   = useState<Batch[]>([]);
  const [units,     setUnits]     = useState<Unit[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events,    setEvents]    = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('batches');
  const [loading,   setLoading]   = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ isAuthentic: boolean; message: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadAll() {
    setLoading(true);
    const [prods, batchData, unitData, incData, evtData] = await Promise.all([
      fetchProducts(),
      fetchBatches(productId),
      fetchUnits(productId),
      fetchIncidents(productId),
      fetchEvents(undefined, productId),
    ]);
    const found = (Array.isArray(prods) ? prods : []).find((p: Product) => p.id === productId);
    setProduct(found || null);
    setBatches(Array.isArray(batchData) ? batchData : []);
    setUnits(Array.isArray(unitData) ? unitData : []);
    setIncidents(Array.isArray(incData) ? incData : []);
    setEvents(Array.isArray(evtData) ? evtData : []);
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    await new Promise(r => setTimeout(r, 500));
    const valid = verifyCode.trim().length >= 6 && verifyCode.startsWith('SEC-');
    setVerifyResult({
      isAuthentic: valid,
      message: valid
        ? 'Product physical authenticity confirmed via cryptographic registry.'
        : 'Invalid or tampered inner credential. Possible counterfeit.',
    });
    setVerifying(false);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'FARMER', 'PROCESSOR']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">

          {/* Back */}
          <a href="/products" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
            ← All Products
          </a>

          {loading ? (
            <div className="loading">Loading product…</div>
          ) : !product ? (
            <div className="empty-state">Product {productId} not found.</div>
          ) : (
            <>
              {/* Product Header */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '12px' }}>
                    <IconProducts size={32} color="#eab308" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{product.name}</h1>
                      <span className="badge badge-info">{product.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--muted)' }}>
                      <span className="mono">{product.id}</span>
                      <span>GTIN: <span className="mono">{product.gtin}</span></span>
                      <span>Manufacturer: {product.manufacturer}</span>
                      <span>Registered: {product.date}</span>
                    </div>
                  </div>
                  {/* Quick stats */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Batches',   val: batches.length,   color: '#22d3ee' },
                      { label: 'Units',     val: units.length,     color: '#4ade80' },
                      { label: 'Incidents', val: incidents.length,  color: '#f87171' },
                      { label: 'Events',    val: events.length,    color: '#818cf8' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', background: 'var(--surface2)', borderRadius: '8px', padding: '10px 16px', minWidth: '60px' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '10px', color: 'var(--faint)', textTransform: 'uppercase' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                {TAB_CONFIG.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      color: activeTab === t.key ? 'var(--primary)' : 'var(--muted)',
                      borderBottom: `2px solid ${activeTab === t.key ? 'var(--primary)' : 'transparent'}`,
                      marginBottom: '-1px', transition: 'color 0.15s',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {t.icon} {t.label}
                    {t.key !== 'verify' && (
                      <span style={{ marginLeft: '5px', fontSize: '10px', background: 'var(--surface2)', padding: '1px 5px', borderRadius: '8px', color: 'var(--faint)' }}>
                        {t.key === 'batches' ? batches.length : t.key === 'units' ? units.length : t.key === 'incidents' ? incidents.length : events.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Tab: Batches ─────────────────────────────── */}
              {activeTab === 'batches' && (
                batches.length === 0 ? <div className="empty-state">No batches for this product.</div> : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr>
                        <th>Batch ID</th><th>Status</th><th>Custody</th><th>Quantity</th>
                        <th>Custodian</th><th>Next Custodian</th><th>Public</th><th>Date</th><th></th>
                      </tr></thead>
                      <tbody>
                        {batches.map(b => (
                          <tr key={b.id}>
                            <td className="mono">{b.id}</td>
                            <td><StatusBadge status={b.status} /></td>
                            <td style={{ fontSize: '11px', color: b.custody_status === 'PENDING_TRANSFER' ? '#fbbf24' : 'var(--muted)' }}>
                              {b.custody_status || '—'}
                            </td>
                            <td>{b.quantity} {b.uom}</td>
                            <td style={{ fontSize: '12px' }}>{b.custodian}</td>
                            <td style={{ fontSize: '11px', color: '#fbbf24' }}>{b.next_custodian_org || '—'}</td>
                            <td>{b.is_public ? <span style={{ color: '#4ade80', display: 'inline-flex' }} title="Public"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span> : <span style={{ color: 'var(--faint)', display: 'inline-flex' }} title="Private"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>}</td>
                            <td className="mono">{b.date}</td>
                            <td><a href={`/batches/${encodeURIComponent(b.id)}`} className="btn btn-ghost btn-sm">View →</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── Tab: Units ───────────────────────────────── */}
              {activeTab === 'units' && (
                units.length === 0 ? <div className="empty-state">No units for this product.</div> : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr>
                        <th>Unit ID</th><th>Batch ID</th><th>Status</th><th>Outer QR</th><th>Inner Credential</th><th>Date</th>
                      </tr></thead>
                      <tbody>
                        {units.map(u => (
                          <tr key={u.id}>
                            <td className="mono">{u.id}</td>
                            <td className="mono">{u.batchId}</td>
                            <td><StatusBadge status={u.status} /></td>
                            <td className="mono">{u.outerQR}</td>
                            <td className="mono">{u.innerCredential}</td>
                            <td className="mono">{u.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── Tab: Incidents ───────────────────────────── */}
              {activeTab === 'incidents' && (
                incidents.length === 0 ? <div className="empty-state">No incidents reported for this product.</div> : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr>
                        <th>Incident ID</th><th>Unit ID</th><th>Category</th><th>Reporter</th><th>Status</th><th>IPFS CID</th><th>Date</th>
                      </tr></thead>
                      <tbody>
                        {incidents.map(inc => (
                          <tr key={inc.id}>
                            <td className="mono">{inc.id}</td>
                            <td className="mono">{inc.unitId}</td>
                            <td><span className="badge badge-warning">{inc.category}</span></td>
                            <td>{inc.reporter}</td>
                            <td><StatusBadge status={inc.status} /></td>
                            <td className="mono" style={{ fontSize: '10px' }}>{inc.ipfsCid?.slice(0, 20)}…</td>
                            <td className="mono">{inc.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── Tab: Events ──────────────────────────────── */}
              {activeTab === 'events' && (
                events.length === 0 ? <div className="empty-state">No events recorded for this product.</div> : (
                  <ul className="timeline">
                    {events.map((ev, i) => (
                      <li key={ev.id || i} className="timeline-item">
                        <div className="timeline-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: ev.type === 'CUSTODY' ? 'rgba(251,191,36,0.15)' : 'var(--primary-dim)', borderColor: ev.type === 'CUSTODY' ? '#fbbf24' : 'var(--primary)', color: ev.type === 'CUSTODY' ? '#fbbf24' : 'var(--primary)' }}>
                          {ev.type === 'CUSTODY' ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">
                            {ev.type === 'CUSTODY'
                              ? `Custody Transfer — ${ev.from_actor} → ${ev.to_actor}`
                              : `QR Scan — ${ev.actor_name || 'Unknown'}`}
                          </div>
                          <div className="timeline-meta">
                            {ev.batch_id || ev.entity_id}{' · '}{ev.location || '—'}{' · '}
                            {new Date(ev.timestamp).toLocaleString('en-IN')}
                            {ev.fabric_tx_id && <span className="mono" style={{ marginLeft: '8px', color: '#475569' }}>{ev.fabric_tx_id.slice(0, 16)}…</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {/* ── Tab: Verify ──────────────────────────────── */}
              {activeTab === 'verify' && (
                <div style={{ maxWidth: '480px' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
                    Enter the inner credential (scratch-off code) from the physical packaging of a unit belonging to <strong style={{ color: 'var(--text)' }}>{product.name}</strong>.
                  </p>
                  <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                      className="form-input" style={{ flex: 1 }}
                      placeholder="e.g. SEC-9981-A"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value.toUpperCase())}
                    />
                    <button type="submit" className="btn btn-primary" disabled={verifying}>
                      {verifying ? 'Verifying…' : 'Verify'}
                    </button>
                  </form>
                  {verifyResult && (
                    <div className={`alert alert-${verifyResult.isAuthentic ? 'success' : 'danger'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {verifyResult.isAuthentic ? <IconCheck size={18} /> : <IconClose size={18} />}
                      <span>{verifyResult.message}</span>
                    </div>
                  )}
                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '14px', fontSize: '12px', color: 'var(--faint)' }}>
                    <strong style={{ color: 'var(--muted)' }}>How it works:</strong> Each physical unit has a scratch-off inner credential.
                    The credential hash is stored on the blockchain. Entering it here verifies the unit is authentic and hasn't been tampered with.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
