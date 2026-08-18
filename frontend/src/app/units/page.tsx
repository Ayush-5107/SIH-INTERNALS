'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchUnits, generateUnits, generateQR, fetchBatches } from '@/lib/api';
import { IconUnitsQR, IconPlus, IconCheck, IconCopy, IconClose, IconTrack, IconActivity } from '@/components/icons/Icons';
import '../app.css';

interface Unit { id: string; batchId: string; status: string; outerQR: string; innerCredential: string; date: string; }
interface Batch { id: string; quantity: number; [key: string]: any; }

export default function UnitsPage() {
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ batchId: '', count: '1' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [unitsData, batchesData] = await Promise.all([fetchUnits(), fetchBatches()]);
    setAllUnits(Array.isArray(unitsData) ? unitsData : []);
    setBatches(Array.isArray(batchesData) ? batchesData : []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.batchId || !form.count) { setMsg({ type: 'danger', text: 'All fields required.' }); return; }
    const count = Math.min(Math.max(1, Number(form.count)), 100);
    setSubmitting(true);
    try {
      const res = await generateUnits({ batchId: form.batchId, count });
      const newUnits = res.units || (res.unit ? [res.unit] : []);
      if (newUnits.length > 0) {
        setAllUnits(prev => [...newUnits, ...prev]);
        setMsg({ type: 'success', text: `${newUnits.length} unit(s) generated successfully.` });
        setForm({ batchId: '', count: '1' });
        setShowForm(false);
      } else {
        setMsg({ type: 'danger', text: 'No units returned.' });
      }
    } catch {
      setMsg({ type: 'danger', text: 'An error occurred.' });
    }
    setSubmitting(false);
  }

  async function showQR(unit: Unit) {
    if (qrImages[unit.id]) { setQrImages(prev => { const n = {...prev}; delete n[unit.id]; return n; }); return; }
    const res = await generateQR({ unit_id: unit.id, public_reference: unit.outerQR });
    if (res.qr?.qr_image_url) setQrImages(prev => ({ ...prev, [unit.id]: res.qr.qr_image_url }));
  }

  function copyToClipboard(text: string, unitId: string) {
    navigator.clipboard.writeText(text);
    setCopied(unitId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'PACKAGER']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                <IconUnitsQR size={28} color="#facc15" /> Units
              </h1>
              <p className="page-subtitle">Serialized unit registry ({allUnits.length} total)</p>
            </div>
            <button id="toggle-generate-units" className="btn btn-primary" onClick={() => { setShowForm(v => !v); setMsg(null); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showForm ? <><IconClose size={14} /> Cancel</> : <><IconPlus size={14} /> Generate Units</>}
            </button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontWeight: 600, color: '#0f172a' }}>View Units for Batch:</label>
            <input 
              list="batch-options"
              className="form-input" 
              style={{ maxWidth: '300px' }}
              value={selectedBatchFilter} 
              onChange={e => setSelectedBatchFilter(e.target.value)}
              placeholder="Type or select a batch..."
            />
            <datalist id="batch-options">
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.id} (Qty: {b.quantity})</option>
              ))}
            </datalist>
          </div>

          {batches.find(b => b.id === selectedBatchFilter) && (() => {
            const selectedBatch = batches.find(b => b.id === selectedBatchFilter)!;
            return (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', gap: '24px', fontSize: '14px', flexWrap: 'wrap' }}>
                <div style={{ width: '100%' }}><h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a' }}>Batch Information</h3></div>
                <div><span style={{ color: '#64748b' }}>Product ID:</span> <span className="mono">{selectedBatch.productId}</span></div>
                <div><span style={{ color: '#64748b' }}>Status:</span> <span className="badge badge-info" style={{background: '#e0f2fe', color: '#0284c7'}}>{selectedBatch.status}</span></div>
                <div><span style={{ color: '#64748b' }}>Batch Capacity:</span> {selectedBatch.quantity} {selectedBatch.uom}</div>
                <div><span style={{ color: '#64748b' }}>Generated QR Units:</span> <strong style={{color: '#0f172a'}}>{allUnits.filter(u => u.batchId === selectedBatch.id).length} / {selectedBatch.quantity}</strong></div>
                <div><span style={{ color: '#64748b' }}>Custodian:</span> {selectedBatch.custodian}</div>
                <div><span style={{ color: '#64748b' }}>Date:</span> {selectedBatch.date}</div>
              </div>
            );
          })()}

          {showForm && (
            <div className="form-section">
              <h2 className="section-title">Generate New Units</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Batch ID *</label>
                    <select id="unit-batchId" className="form-input" value={form.batchId} onChange={e => setForm(p => ({...p, batchId: e.target.value}))}>
                      <option value="">Select a batch</option>
                      {batches.map(b => {
                        const unitsForBatch = allUnits.filter(u => u.batchId === b.id).length;
                        const remaining = b.quantity - unitsForBatch;
                        return (
                          <option key={b.id} value={b.id} disabled={remaining <= 0}>
                            {b.id} (Qty: {b.quantity}, Remaining: {remaining})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Count (1–100) *</label>
                    <input id="unit-count" type="number" min="1" max="100" className="form-input" value={form.count} onChange={e => setForm(p => ({...p, count: e.target.value}))} />
                  </div>
                </div>
                <button id="submit-generate-units" type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {submitting ? 'Generating…' : <><IconActivity size={14} /> Generate</>}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading units…</div>
          ) : !selectedBatchFilter ? (
            <div className="empty-state">Please select a batch above to view its units.</div>
          ) : (() => {
            const displayedUnits = allUnits.filter(u => u.batchId === selectedBatchFilter);
            if (displayedUnits.length === 0) {
              return <div className="empty-state">No units found for this batch. Generate some above.</div>;
            }
            return (
              <div className="table-wrapper">
                <table className="data-table">
                <thead>
                  <tr>
                    <th>Unit ID</th>
                    <th>Batch ID</th>
                    <th>Status</th>
                    <th>Outer QR</th>
                    <th>Inner Credential</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUnits.map(u => (
                    <>
                      <tr key={u.id}>
                        <td className="mono">{u.id}</td>
                        <td className="mono">{u.batchId}</td>
                        <td><span className="badge badge-success">{u.status}</span></td>
                        <td className="mono">{u.outerQR}</td>
                        <td>
                          <span className="mono">{u.innerCredential}</span>{' '}
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => copyToClipboard(u.innerCredential, u.id)}
                            title="Copy to clipboard"
                          >
                            {copied === u.id ? <IconCheck size={14} color="#16a34a" /> : <IconCopy size={14} color="#64748b" />}
                          </button>
                        </td>
                        <td className="mono">{u.date}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => showQR(u)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            {qrImages[u.id] ? <><IconClose size={14} /> Hide QR</> : <><IconTrack size={14} /> Show QR</>}
                          </button>
                        </td>
                      </tr>
                      {qrImages[u.id] && (
                        <tr key={`${u.id}-qr`}>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '16px', background: '#263346' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrImages[u.id]} alt={`QR for ${u.id}`} style={{ borderRadius: '8px', border: '4px solid #1e293b' }} />
                            <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>Scan: {u.outerQR}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            );
          })()}
        </div>
      </div>
    </AuthGuard>
  );
}
