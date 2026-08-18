'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchIncidents } from '@/lib/api';
import { IconIncidents } from '@/components/icons/Icons';
import '../app.css';

interface Incident { id: string; unitId: string; category: string; reporter: string; status: string; ipfsCid: string; date: string; }

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { NEW: 'badge-danger', OPEN: 'badge-warning', RESOLVED: 'badge-success', CLOSED: 'badge-muted' };
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents().then(data => {
      setIncidents(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard allowedRoles={['ADMIN', 'REGULATOR', 'RETAILER']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                <IconIncidents size={28} color="#facc15" /> Incidents
              </h1>
              <p className="page-subtitle">Consumer complaints & food safety incidents ({incidents.length} total)</p>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => {
              setLoading(true);
              fetchIncidents().then(d => { setIncidents(Array.isArray(d) ? d : []); setLoading(false); });
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading incidents…</div>
          ) : incidents.length === 0 ? (
            <div className="empty-state">No incidents found.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Unit ID</th>
                    <th>Category</th>
                    <th>Reporter</th>
                    <th>Status</th>
                    <th>IPFS CID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(inc => (
                    <tr key={inc.id}>
                      <td className="mono" style={{ color: '#f87171' }}>{inc.id}</td>
                      <td className="mono">{inc.unitId}</td>
                      <td><span className="badge badge-warning">{inc.category}</span></td>
                      <td>{inc.reporter}</td>
                      <td><StatusBadge status={inc.status} /></td>
                      <td>
                        <a 
                          href={`https://ipfs.io/ipfs/${inc.ipfsCid}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mono" 
                          style={{ fontSize: '11px', wordBreak: 'break-all', maxWidth: '180px', display: 'inline-block', color: '#3b82f6', textDecoration: 'none' }}
                        >
                          {inc.ipfsCid}
                        </a>
                      </td>
                      <td className="mono">{inc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="alert alert-info" style={{ marginTop: '12px' }}>
            <strong>Note:</strong> All incidents are immutably stored with their IPFS content hash. The responsible organization has been notified via the incident escalation pipeline.
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
