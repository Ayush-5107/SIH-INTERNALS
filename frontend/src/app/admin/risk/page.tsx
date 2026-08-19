'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { propagateRisk } from '@/lib/api';
import '../../app.css';

const DIRECTIONS = ['BOTH', 'UPSTREAM', 'DOWNSTREAM'];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

interface RiskNode { id: string; type: string; label: string; state: string; org_id: string }
interface RiskEdge { source: string; target: string; relation: string }

interface RiskResult {
  source_batch_id: string;
  direction: string;
  affected_parent_batches: Array<{batch_id: string; state: string}>;
  affected_child_batches: Array<{batch_id: string; state: string}>;
  affected_organizations: string[];
  affected_locations: Array<{latitude: number, longitude: number, location_name: string, timestamp: string, batch_id: string, event_type: string}>;
  nodes: RiskNode[];
  edges: RiskEdge[];
  risk_level: string;
  computed_at?: string;
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = { LOW: 'badge-success', MEDIUM: 'badge-warning', HIGH: 'badge-danger', CRITICAL: 'badge-danger' };
  return <span className={`badge ${map[level] || 'badge-muted'}`} style={{ fontSize: '14px', padding: '4px 12px' }}>{level}</span>;
}

export default function RiskPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ source_batch_id: '', direction: 'BOTH', risk_level: 'HIGH', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const bid = searchParams.get('batch_id');
    if (bid && !form.source_batch_id) {
      setForm(p => ({ ...p, source_batch_id: bid }));
      fetchRisk(bid, 'BOTH', 'HIGH', '');
    }
  }, [searchParams]);

  async function fetchRisk(batch_id: string, direction: string, risk_level: string, reason: string) {
    if (!batch_id.trim()) { setError('Source Batch ID is required.'); return; }
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const res = await propagateRisk({
        source_batch_id: batch_id.trim(),
        direction,
        risk_level,
        reason,
      });
      setResult(res);
    } catch {
      setError('Risk propagation failed.');
    }
    setSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchRisk(form.source_batch_id, form.direction, form.risk_level, form.reason);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'REGULATOR']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">🚨 Risk Propagator & Trace View</h1>
              <p className="page-subtitle">Calculate bidirectional affected batch scope across the supply chain lineage graph</p>
            </div>
          </div>

          <div className="alert alert-warning">
            <strong>⚠️ Advisory Tool:</strong> This tool calculates risk scope across the lineage graph. To issue an official batch block or recall, use the <a href="/admin/recalls" style={{ color: '#fbbf24' }}>Recalls page</a>.
          </div>

          <div className="form-section">
            <h2 className="section-title">Risk Propagation Parameters</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Source Batch ID *</label>
                  <input id="risk-batch-id" className="form-input" value={form.source_batch_id} onChange={e => setForm(p => ({...p, source_batch_id: e.target.value}))} placeholder="e.g. BATCH-MBTSDM2UM" />
                </div>
                <div className="form-group">
                  <label className="form-label">Propagation Direction</label>
                  <select id="risk-direction" className="form-select" value={form.direction} onChange={e => setForm(p => ({...p, direction: e.target.value}))}>
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Risk Level</label>
                  <select id="risk-level" className="form-select" value={form.risk_level} onChange={e => setForm(p => ({...p, risk_level: e.target.value}))}>
                    {RISK_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason / Notes</label>
                  <input id="risk-reason" className="form-input" value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="e.g. Pesticide contamination detected" />
                </div>
              </div>
              <button id="risk-submit" type="submit" className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Calculating…' : '🚨 Trace Risk'}
              </button>
            </form>
          </div>

          {result && (
            <div>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>RISK LEVEL</div>
                    <RiskBadge level={result.risk_level} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>SOURCE</div>
                    <div className="mono" style={{ fontSize: '13px', color: '#f1f5f9' }}>{result.source_batch_id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>DIRECTION</div>
                    <span className="badge badge-info">{result.direction}</span>
                  </div>
                  {result.computed_at && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>COMPUTED AT</div>
                      <div className="mono" style={{ fontSize: '11px', color: '#64748b' }}>{new Date(result.computed_at).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">🕸️ Lineage Graph Trace</h2>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', overflowX: 'auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {result.nodes?.length ? result.nodes.map(node => (
                    <div key={node.id} style={{
                      padding: '12px',
                      background: node.id === result.source_batch_id ? '#7f1d1d' : '#1e293b',
                      border: `1px solid ${node.id === result.source_batch_id ? '#ef4444' : '#334155'}`,
                      borderRadius: '6px',
                      minWidth: '180px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{node.id === result.source_batch_id ? 'SOURCE NODE' : 'IMPACTED NODE'}</div>
                      <div className="mono" style={{ fontSize: '13px', color: '#f1f5f9', marginBottom: '6px' }}>{node.id}</div>
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>{node.state}</span>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>Org: {node.org_id || 'Unknown'}</div>
                    </div>
                  )) : <div className="empty-state">No nodes in trace.</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="card">
                  <h2 className="section-title">📍 Affected Locations</h2>
                  {result.affected_locations?.length ? result.affected_locations.map((loc, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{loc.location_name}</span>
                        <span className="badge badge-muted" style={{ fontSize: '10px' }}>{loc.event_type}</span>
                      </div>
                      <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>Batch: {loc.batch_id}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}</div>
                    </div>
                  )) : <div className="empty-state" style={{ padding: '12px' }}>No physical locations identified in trace</div>}
                </div>

                <div className="card">
                  <h2 className="section-title">🏢 Affected Organizations</h2>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {result.affected_organizations?.map(org => (
                      <span key={org} className="badge badge-warning" style={{ fontSize: '12px', padding: '4px 10px' }}>{org}</span>
                    ))}
                    {!result.affected_organizations?.length && <div className="empty-state">No organizations identified</div>}
                  </div>
                </div>
              </div>

              <div className="alert alert-danger" style={{ marginTop: '12px' }}>
                Ready to take action? <a href="/admin/recalls" style={{ color: '#f87171', fontWeight: 600 }}>Issue an official recall →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
