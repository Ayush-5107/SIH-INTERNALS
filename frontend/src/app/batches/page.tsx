'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchBatches, createBatch, acceptCustody, assignNextCustodian, fetchUsers, fetchProducts } from '@/lib/api';
import { getUserName, getUserOrg, getUserRole } from '@/lib/auth';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  ArrowRight,
  UserCheck,
  UserPlus,
  Eye,
  X,
  Layers,
  Building2,
  AlertCircle
} from 'lucide-react';
import '../app.css';

interface Batch {
  id: string;
  productId: string;
  status: string;
  quantity: number;
  uom: string;
  custodian: string;
  next_custodian_username?: string;
  next_custodian_org?: string;
  custody_status?: string;
  is_public?: boolean;
  parent_batch_ids?: string[];
  date: string;
}
interface User { username: string; role: string; org: string; }

const UOMS = ['KG', 'LITERS', 'UNITS', 'TONS', 'GRAMS', 'ML'];

const STATUS_CLASS: Record<string, string> = {
  IN_TRANSIT:  'badge-warning',
  ON_SHELF:    'badge-success',
  VALIDATED:   'badge-success',
  RECALLED:    'badge-danger',
  BLOCKED:     'badge-danger',
  PROCESSING:  'badge-info',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_CLASS[status] || 'badge-muted'}`}>{status}</span>;
}

function CustodyBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, [string, string, React.ReactNode]> = {
    PENDING_TRANSFER: ['#f59e0b', 'PENDING', <Clock key="clk" size={11} />],
    IN_CUSTODY:       ['#10b981', 'IN CUSTODY', <CheckCircle2 key="chk" size={11} />],
    DELIVERED:        ['#6366f1', 'DELIVERED', <Package key="pkg" size={11} />],
  };
  const [color, label, icon] = map[status] || ['#64748b', status, null];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, color, background: `${color}18`, padding: '3px 8px', borderRadius: '6px', border: `1px solid ${color}33`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {icon}
      {label}
    </span>
  );
}

export default function BatchesPage() {
  const [batches, setBatches]   = useState<Batch[]>([]);
  const [users, setUsers]       = useState<User[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]           = useState<{ type: 'success' | 'danger' | 'info' | 'warning'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [form, setForm] = useState({
    productId: '', quantity: '', uom: 'KG',
    isRootBatch: true,
    parentBatchIds: [] as string[],
    parentInput: '',
    nextCustodianUsername: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Per-row actions
  const [acceptLoading, setAcceptLoading]   = useState<string | null>(null);
  const [assignState, setAssignState]       = useState<Record<string, string>>({});
  const [assignLoading, setAssignLoading]   = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch]   = useState<string | null>(null);

  const myUsername = getUserName();
  const myOrg      = getUserOrg();
  const myRole     = getUserRole();

  useEffect(() => {
    load();
    fetchUsers().then(setUsers);
    fetchProducts().then(data => setProducts(Array.isArray(data) ? data : []));
  }, []);

  async function load() {
    setLoading(true);
    const data = await fetchBatches();
    setBatches(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function addParent() {
    const id = form.parentInput.trim().toUpperCase();
    if (!id || form.parentBatchIds.includes(id)) return;
    setForm(p => ({ ...p, parentBatchIds: [...p.parentBatchIds, id], parentInput: '' }));
  }
  function removeParent(id: string) {
    setForm(p => ({ ...p, parentBatchIds: p.parentBatchIds.filter(x => x !== id) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.quantity) {
      setMsg({ type: 'danger', text: 'Product ID and Quantity are required.' });
      return;
    }
    if (!form.isRootBatch && form.parentBatchIds.length === 0) {
      setMsg({ type: 'danger', text: 'Please add at least one parent batch ID.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBatch({
        productId: form.productId,
        quantity: Number(form.quantity),
        uom: form.uom,
        custodian: myOrg || myUsername,
        next_custodian_username: form.nextCustodianUsername || undefined,
        parent_batch_ids: form.isRootBatch ? [] : form.parentBatchIds,
      });
      const newBatch = res.batch || res;
      if (newBatch?.id) {
        setBatches(prev => [newBatch, ...prev]);
        setMsg({ type: 'success', text: `Batch ${newBatch.id} created successfully.${form.nextCustodianUsername ? ` Awaiting acceptance by ${form.nextCustodianUsername}.` : ''}` });
        setForm({ productId: '', quantity: '', uom: 'KG', isRootBatch: true, parentBatchIds: [], parentInput: '', nextCustodianUsername: '' });
        setShowForm(false);
      } else {
        setMsg({ type: 'danger', text: 'Failed to create batch.' });
      }
    } catch {
      setMsg({ type: 'danger', text: 'An error occurred creating the batch.' });
    }
    setSubmitting(false);
  }

  async function handleAccept(batch: Batch) {
    if (!myUsername) return;
    setAcceptLoading(batch.id);
    setMsg(null);
    try {
      const res = await acceptCustody(batch.id, myUsername);
      setMsg({ type: 'success', text: res.message });
      setBatches(prev => prev.map(b =>
        b.id === batch.id
          ? { ...b, custodian: res.new_custodian, status: res.new_status, custody_status: res.is_public ? 'DELIVERED' : 'IN_CUSTODY', is_public: res.is_public, next_custodian_username: undefined, next_custodian_org: undefined }
          : b
      ));
    } catch (err: unknown) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Accept failed.' });
    }
    setAcceptLoading(null);
  }

  async function handleAssign(batchId: string) {
    const nextUser = assignState[batchId]?.trim();
    if (!nextUser) return;
    setAssignLoading(batchId);
    setMsg(null);
    try {
      const res = await assignNextCustodian(batchId, nextUser, myUsername);
      setMsg({ type: 'info', text: res.message });
      setBatches(prev => prev.map(b =>
        b.id === batchId
          ? { ...b, next_custodian_username: res.next_custodian_username, next_custodian_org: res.next_custodian_org, custody_status: 'PENDING_TRANSFER' }
          : b
      ));
      setAssignState(s => ({ ...s, [batchId]: '' }));
    } catch (err: unknown) {
      setMsg({ type: 'danger', text: err instanceof Error ? err.message : 'Assign failed.' });
    }
    setAssignLoading(null);
  }

  const myPendingBatches = batches.filter(b =>
    (b.next_custodian_username || '').toLowerCase() === myUsername.toLowerCase() &&
    b.custody_status === 'PENDING_TRANSFER'
  );

  const filteredBatches = batches.filter(b =>
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.custodian.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPublicCount = batches.filter(b => b.is_public).length;
  const totalPendingCount = batches.filter(b => b.custody_status === 'PENDING_TRANSFER').length;

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div className="app-container">

          {/* Header Bar */}
          <div className="page-header">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={24} color="#0f172a" /> Batches Registry
              </h1>
              <p className="page-subtitle">
                Food supply chain batch tracking ({batches.length} total) — Logged in as{' '}
                <strong style={{ color: '#0f172a' }}>{myUsername}</strong>{' '}
                <span style={{ color: '#64748b', fontSize: '11px' }}>({myRole})</span>
              </p>
            </div>
            <button
              id="toggle-add-batch"
              className="btn btn-primary"
              onClick={() => { setShowForm(v => !v); setMsg(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create Batch</>}
            </button>
          </div>

          {/* Metric Cards Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Batches</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{batches.length}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Public Scannable</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{totalPublicCount}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pending Transfers</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{totalPendingCount}</div>
              </div>
            </div>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {/* Pending Custody Alert */}
          {myPendingBatches.length > 0 && (
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> <strong>{myPendingBatches.length} batch(es)</strong> are awaiting your custody acceptance.
              </span>
              <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>Scroll down to click Accept →</span>
            </div>
          )}

          {/* Create Batch Form */}
          {showForm && (
            <div className="form-section">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /> Create New Batch
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginBottom: '18px' }}>
                  <div className="form-group">
                    <label className="form-label">Product *</label>
                    <select id="batch-productId" className="form-select" value={form.productId} onChange={e => setForm(p => ({ ...p, productId: e.target.value }))} required>
                      <option value="" disabled>Select a product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input id="batch-quantity" type="number" min="1" className="form-input" value={form.quantity}
                      onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 5000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit of Measure</label>
                    <select id="batch-uom" className="form-select" value={form.uom}
                      onChange={e => setForm(p => ({ ...p, uom: e.target.value }))}>
                      {UOMS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {/* Lineage */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> Batch Lineage
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {[true, false].map(isRoot => (
                      <button
                        key={String(isRoot)}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, isRootBatch: isRoot, parentBatchIds: [] }))}
                        style={{
                          flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                          border: `2px solid ${form.isRootBatch === isRoot ? '#0284c7' : '#cbd5e1'}`,
                          background: form.isRootBatch === isRoot ? '#e0f2fe' : '#ffffff',
                          color: form.isRootBatch === isRoot ? '#0369a1' : '#64748b',
                        }}
                      >
                        {isRoot ? '🌱 Root Origin Batch (No parents)' : '🔗 Derived Batch (Has parent batches)'}
                      </button>
                    ))}
                  </div>

                  {!form.isRootBatch && (
                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 14px', border: '1px solid #cbd5e1' }}>
                      <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Parent Batch IDs</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input className="form-input" style={{ flex: 1 }}
                          value={form.parentInput}
                          onChange={e => setForm(p => ({ ...p, parentInput: e.target.value.toUpperCase() }))}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addParent(); } }}
                          placeholder="e.g. BATCH-MBTSDM2UM" />
                        <button type="button" className="btn btn-ghost btn-sm" onClick={addParent}>+ Add</button>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {form.parentBatchIds.map(id => (
                          <span key={id} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {id}
                            <button type="button" onClick={() => removeParent(id)} style={{ background: 'none', border: 'none', color: '#0369a1', cursor: 'pointer', fontSize: '14px', padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Custodian */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserPlus size={14} /> Assign Next Custodian (Optional)
                  </label>
                  <select
                    className="form-select"
                    value={form.nextCustodianUsername}
                    onChange={e => setForm(p => ({ ...p, nextCustodianUsername: e.target.value }))}
                  >
                    <option value="">— Skip for now —</option>
                    {users.filter(u => u.username !== myUsername).map(u => (
                      <option key={u.username} value={u.username}>
                        {u.username} · {u.org} [{u.role}]
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button id="submit-batch" type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating…' : '✓ Create Batch'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search batch ID, product ID, custodian..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Batch Table */}
          {loading ? (
            <div className="loading">Loading batches…</div>
          ) : filteredBatches.length === 0 ? (
            <div className="empty-state">No batches found matching criteria.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Product ID</th>
                    <th>Status</th>
                    <th>Custody</th>
                    <th>Qty</th>
                    <th>Custodian</th>
                    <th>Next Custodian</th>
                    <th>Public</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.map(b => {
                    const isMyAcceptable = (b.next_custodian_username || '').toLowerCase() === myUsername.toLowerCase() && b.custody_status === 'PENDING_TRANSFER';
                    const amCurrentCustodian = b.custodian === (myOrg || myUsername);
                    const isExpanded = expandedBatch === b.id;

                    return (
                      <>
                        <tr key={b.id} style={isMyAcceptable ? { background: '#fef3c7' } : undefined}>
                          <td className="mono" style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{b.id}</td>
                          <td className="mono" style={{ fontSize: '12px' }}>{b.productId}</td>
                          <td><StatusBadge status={b.status} /></td>
                          <td><CustodyBadge status={b.custody_status} /></td>
                          <td style={{ fontSize: '12px', fontWeight: 700 }}>{b.quantity} {b.uom}</td>
                          <td style={{ fontSize: '12px', fontWeight: 600 }}>{b.custodian}</td>
                          <td style={{ fontSize: '12px' }}>
                            {b.next_custodian_org
                              ? <span style={{ color: isMyAcceptable ? '#d97706' : '#64748b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {b.next_custodian_org}</span>
                              : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td>
                            {b.is_public
                              ? <span style={{ color: '#059669', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Globe size={13} /> Yes</span>
                              : <span style={{ color: '#64748b', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Lock size={13} /> No</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <a href={`/batches/${encodeURIComponent(b.id)}`} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Eye size={13} /> View
                              </a>

                              {/* Accept custody */}
                              {isMyAcceptable && (
                                <button
                                  className="btn btn-sm"
                                  style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  disabled={acceptLoading === b.id}
                                  onClick={() => handleAccept(b)}
                                >
                                  <UserCheck size={13} /> Accept
                                </button>
                              )}

                              {/* Assign next custodian */}
                              {amCurrentCustodian && !b.next_custodian_username && b.status !== 'ON_SHELF' && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setExpandedBatch(isExpanded ? null : b.id)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <UserPlus size={13} /> {isExpanded ? 'Cancel' : 'Assign'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Inline Assign Next Custodian Panel */}
                        {isExpanded && amCurrentCustodian && (
                          <tr key={`${b.id}-assign`}>
                            <td colSpan={9} style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #cbd5e1' }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <UserPlus size={14} /> Assign next custodian for <strong>{b.id}</strong>:
                                </span>
                                <select
                                  className="form-select"
                                  style={{ fontSize: '12px', height: '34px', width: 'auto', minWidth: '220px' }}
                                  value={assignState[b.id] || ''}
                                  onChange={e => setAssignState(s => ({ ...s, [b.id]: e.target.value }))}
                                >
                                  <option value="">— Select user —</option>
                                  {users.filter(u => u.username !== myUsername).map(u => (
                                    <option key={u.username} value={u.username}>
                                      {u.username} · {u.org} [{u.role}]
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={!assignState[b.id] || assignLoading === b.id}
                                  onClick={() => handleAssign(b.id)}
                                >
                                  {assignLoading === b.id ? 'Assigning…' : '✓ Confirm Assignment'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
