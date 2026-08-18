'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchBatches, fetchLineage, fetchEvents, recordCustodyTransfer, generateQR, fetchUnits } from '@/lib/api';
import { generateBatchPdf } from '@/lib/pdfGenerator';
import {
  Package,
  ArrowLeft,
  Printer,
  RefreshCw,
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import '../../app.css';

interface Batch { id: string; productId: string; status: string; quantity: number; uom: string; custodian: string; date: string; }
interface LineageData { batch_id: string; parents: Array<{batch_id: string; state: string}>; children: Array<{batch_id: string; state: string}>; }
interface Event { id?: string; type?: string; actor_role?: string; entity_id?: string; batch_id?: string; actor_name?: string; from_actor?: string; to_actor?: string; location?: string; timestamp?: string; fabric_tx_id?: string; }
interface Unit { unit_id: string; batch_id: string; batch_prefix: string; packet_code: string; serial_number: string; status: string; outer_qr?: string; inner_credential?: string; }

function deriveBatchPrefix(batchId: string): string {
  const clean = batchId.replace(/^BATCH-?/i, '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (clean.length >= 3) return clean.slice(0, 3);
  let hash = 0;
  for (let i = 0; i < batchId.length; i++) {
    hash = (hash << 5) - hash + batchId.charCodeAt(i);
    hash |= 0;
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const pos = Math.abs(hash);
  return chars[pos % chars.length] + chars[(pos >> 5) % chars.length] + chars[(pos >> 10) % chars.length];
}

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batchId = decodeURIComponent(id);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [lineage, setLineage] = useState<LineageData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [custodyForm, setCustodyForm] = useState({ from_actor: '', to_actor: '', event_type: 'TRANSFER', location: '' });
  const [custodyMsg, setCustodyMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [submittingCustody, setSubmittingCustody] = useState(false);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // PDF Generation State
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allBatches, lin, evts] = await Promise.all([
        fetchBatches(),
        fetchLineage(batchId),
        fetchEvents(batchId),
      ]);
      let found = Array.isArray(allBatches) ? allBatches.find((b: Batch) => b.id.toLowerCase() === batchId.toLowerCase()) : null;
      if (!found) {
        found = {
          id: batchId,
          productId: 'PROD-001',
          status: 'PROCESSING',
          quantity: 66,
          uom: 'KG',
          custodian: 'Admin',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
      }
      setBatch(found);
      setLineage(lin);
      setEvents(Array.isArray(evts) ? evts : []);
      setLoading(false);
    }
    load();
  }, [batchId]);

  async function handleCustodySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!custodyForm.from_actor || !custodyForm.to_actor) {
      setCustodyMsg({ type: 'danger', text: 'From and To actor are required.' });
      return;
    }
    setSubmittingCustody(true);
    try {
      const res = await recordCustodyTransfer({ batch_id: batchId, ...custodyForm });
      if (res.status === 'success' || res.custody) {
        setCustodyMsg({ type: 'success', text: `Custody transfer recorded. TX: ${res.custody?.fabric_tx_id || '—'}` });
        const evts = await fetchEvents(batchId);
        setEvents(Array.isArray(evts) ? evts : []);
        setCustodyForm({ from_actor: '', to_actor: '', event_type: 'TRANSFER', location: '' });
      } else {
        setCustodyMsg({ type: 'danger', text: 'Transfer failed.' });
      }
    } catch {
      setCustodyMsg({ type: 'danger', text: 'An error occurred.' });
    }
    setSubmittingCustody(false);
  }

  async function handleGenerateQR() {
    setGeneratingQR(true);
    const res = await generateQR({ unit_id: batchId, public_reference: `QR-${batchId}` });
    if (res.qr?.qr_image_url) {
      setQrResult(res.qr.qr_image_url);
    }
    setGeneratingQR(false);
  }

  async function handleDirectPdfDownload() {
    setPdfGenerating(true);
    try {
      const prefix = deriveBatchPrefix(batchId);
      const targetQuantity = batch?.quantity || 10;
      const count = Math.min(Math.max(targetQuantity, 1), 1000);

      let unitsList: Unit[] = [];
      try {
        const units = await fetchUnits(undefined, batchId);
        unitsList = Array.isArray(units) ? units : [];
      } catch {
        unitsList = [];
      }

      const finalUnits: Unit[] = [];
      for (let i = 0; i < count; i++) {
        const seq = String(i + 1).padStart(6, '0');
        const existing = unitsList[i];
        const defaultCode = `${prefix}-${seq}`;
        const rawCode = existing?.packet_code || existing?.serial_number || existing?.unit_id || defaultCode;
        const packetCode = rawCode.trim().length > 0 ? rawCode : defaultCode;

        finalUnits.push({
          unit_id: existing?.unit_id || `UNIT-${prefix}-${seq}`,
          batch_id: batchId,
          batch_prefix: prefix,
          packet_code: packetCode,
          serial_number: existing?.serial_number || `${prefix}-${seq}`,
          status: existing?.status || 'AVAILABLE',
          outer_qr: existing?.outer_qr || `QR-${batchId}`,
          inner_credential: existing?.inner_credential || `SEC-${1000 + ((i + 1) * 37) % 9000}-${String.fromCharCode(65 + (i % 26))}`
        });
      }

      await generateBatchPdf(batchId, finalUnits);
    } catch (err: unknown) {
      console.error('PDF Generation Error:', err);
      alert('PDF Generation failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setPdfGenerating(false);
  }

  if (loading) return <AuthGuard><div className="app-page"><AppNav /><div className="loading">Loading batch details…</div></div></AuthGuard>;

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={24} color="#0f172a" /> Batch Details
              </h1>
              <p className="page-subtitle mono" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{batchId}</p>
            </div>
            <a href="/batches" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Batches
            </a>
          </div>

          {batch && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  ['Batch ID', batch.id, <Package key="1" size={14} color="#64748b" />],
                  ['Product ID', batch.productId, <Activity key="2" size={14} color="#64748b" />],
                  ['Status', batch.status, <ShieldCheck key="3" size={14} color="#64748b" />],
                  ['Quantity', `${batch.quantity} ${batch.uom}`, <Package key="4" size={14} color="#64748b" />],
                  ['Custodian', batch.custodian, <User key="5" size={14} color="#64748b" />],
                  ['Date', batch.date, <Calendar key="6" size={14} color="#64748b" />],
                ].map(([k, v, icon]) => (
                  <div key={k as string}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {icon} {k}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0f172a', fontFamily: 'var(--mono)', fontWeight: 800 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lineage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpRight size={18} color="#0284c7" /> Parent Batches
              </h2>
              {lineage?.parents?.length ? lineage.parents.map(p => (
                <div key={p.batch_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <a href={`/batches/${encodeURIComponent(p.batch_id)}`} className="mono" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 800 }}>{p.batch_id}</a>
                  <span className="badge badge-info">{p.state}</span>
                </div>
              )) : <div className="empty-state" style={{ padding: '16px', fontSize: '13px' }}>No parent batches</div>}
            </div>

            <div className="card">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownRight size={18} color="#d97706" /> Child Batches
              </h2>
              {lineage?.children?.length ? lineage.children.map(c => (
                <div key={c.batch_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #cbd5e1' }}>
                  <a href={`/batches/${encodeURIComponent(c.batch_id)}`} className="mono" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 800 }}>{c.batch_id}</a>
                  <span className="badge badge-warning">{c.state}</span>
                </div>
              )) : <div className="empty-state" style={{ padding: '16px', fontSize: '13px' }}>No child batches</div>}
            </div>
          </div>

          {/* Record Custody Transfer Form */}
          <div className="form-section">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} color="#0f172a" /> Record Custody Transfer
            </h2>
            {custodyMsg && <div className={`alert alert-${custodyMsg.type}`}>{custodyMsg.text}</div>}
            <form onSubmit={handleCustodySubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">From Actor *</label>
                  <input id="custody-from" className="form-input" value={custodyForm.from_actor} onChange={e => setCustodyForm(p => ({...p, from_actor: e.target.value}))} placeholder="Current custodian" />
                </div>
                <div className="form-group">
                  <label className="form-label">To Actor *</label>
                  <input id="custody-to" className="form-input" value={custodyForm.to_actor} onChange={e => setCustodyForm(p => ({...p, to_actor: e.target.value}))} placeholder="New custodian" />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select id="custody-type" className="form-select" value={custodyForm.event_type} onChange={e => setCustodyForm(p => ({...p, event_type: e.target.value}))}>
                    <option value="TRANSFER">TRANSFER</option>
                    <option value="HANDOVER">HANDOVER</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input id="custody-location" className="form-input" value={custodyForm.location} onChange={e => setCustodyForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Mumbai Warehouse" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button id="submit-custody" type="submit" className="btn btn-primary" disabled={submittingCustody} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {submittingCustody ? 'Recording…' : <><CheckCircle2 size={15} /> Record Transfer</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={handleGenerateQR} disabled={generatingQR} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {generatingQR ? 'Generating…' : <><QrCode size={15} /> Generate QR</>}
                </button>
              </div>
            </form>
            {qrResult && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrResult} alt="Batch QR Code" style={{ border: '4px solid #cbd5e1', borderRadius: '8px' }} />
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>QR for batch {batchId}</p>
              </div>
            )}
          </div>

          {/* Events Table */}
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#0f172a" /> Batch Events Log
          </h2>
          {events.length === 0 ? (
            <div className="empty-state">No events recorded for this batch.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Type</th><th>Actor</th><th>Location</th><th>Timestamp</th><th>Fabric TX</th></tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-info">{ev.type || '—'}</span></td>
                      <td style={{ fontWeight: 600 }}>{ev.actor_name || ev.from_actor || '—'}{ev.to_actor ? ` → ${ev.to_actor}` : ''}</td>
                      <td>{ev.location || '—'}</td>
                      <td className="mono">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}</td>
                      <td className="mono" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.fabric_tx_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Print Button Section */}
          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px dashed #cbd5e1', textAlign: 'center', marginBottom: '40px' }}>
            <button
              id="download-batch-qr-pdf"
              className="btn"
              disabled={pdfGenerating}
              onClick={handleDirectPdfDownload}
              style={{
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: '1.5px solid #047857',
                borderRadius: '14px',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Printer size={20} />
              {pdfGenerating ? 'Generating PDF Sheet…' : 'PRINT QR CODES'}
            </button>
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              Directly generates and downloads <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 800 }}>{batchId}-QR-CODES.pdf</code> featuring the FoodTrace Factory Laser Print Sheet layout.
            </p>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
