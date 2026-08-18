'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchDashboardMetrics } from '@/lib/api';
import { IconOverview, IconPlus, IconActivity, IconShield, IconBatches } from '@/components/icons/Icons';
import '../app.css';

interface Metrics {
  total_products: number;
  total_batches: number;
  total_units: number;
  in_transit: number;
  quarantined: number;
  open_incidents: number;
  total_scans: number;
  total_custody_transfers: number;
  traceability_coverage: string;
  compliance_rate: string;
  recent_events: Array<Record<string, unknown>>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Batches' | 'Custody' | 'Scans'>('All');

  useEffect(() => {
    fetchDashboardMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const stats = metrics ? [
    { label: 'Total Products', value: metrics.total_products.toLocaleString(), trend: '+8.2%', isGood: true, subText: 'Registered catalog' },
    { label: 'Total Batches', value: metrics.total_batches.toLocaleString(), trend: '+3.1%', isGood: true, subText: 'Active supply chain' },
    { label: 'In Transit', value: metrics.in_transit.toLocaleString(), trend: metrics.in_transit > 0 ? 'Active flow' : '0 in-flight', isGood: true, subText: 'Custody pending / in-flight' },
    { label: 'Open Incidents', value: metrics.open_incidents.toLocaleString(), trend: metrics.open_incidents === 0 ? 'Optimal' : 'Needs review', isGood: metrics.open_incidents === 0, subText: 'Audit & safety alerts' },
  ] : [];

  return (
    <AuthGuard>
      <div className="app-page">
        <AppNav />
        <div style={{ padding: '24px 32px 40px 32px', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Top Title Section */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              Overview
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Your communications & supply chain activity across every channel.
            </p>
          </div>

          {loading ? (
            <div className="loading">Loading operational metrics…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
              
              {/* ── Left Main Column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 4 Summary Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {stats.map((s, idx) => (
                    <div
                      key={s.label}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '20px 22px',
                        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '130px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{s.label}</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b'
                        }}>
                          <IconActivity size={13} color="currentColor" />
                        </div>
                      </div>

                      <div style={{ margin: '10px 0 6px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>
                          {s.value}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: s.isGood ? '#dcfce7' : '#fee2e2',
                          color: s.isGood ? '#15803d' : '#b91c1c',
                        }}>
                          {s.trend}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                        {s.subText}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Large Chart Visualiser Card: Usage / Traceability Over Time */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        Traceability over time
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>15,890</span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>vs prev 30 days</span>
                      </div>
                    </div>

                    {/* Filter Tabs matching image */}
                    <div style={{ display: 'flex', background: '#f4f6f8', padding: '4px', borderRadius: '20px', gap: '4px' }}>
                      {(['All', 'Batches', 'Custody', 'Scans'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveFilter(tab)}
                          style={{
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: activeFilter === tab ? '#fde047' : 'transparent',
                            color: activeFilter === tab ? '#0f172a' : '#64748b',
                            boxShadow: activeFilter === tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Striped Bar Chart SVG Graphic matching screenshot */}
                  <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 10px 0 10px', position: 'relative' }}>
                    
                    {/* Background grid lines */}
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', borderTop: '1px dashed #f1f5f9' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed #f1f5f9' }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: '80%', borderTop: '1px dashed #f1f5f9' }} />

                    {[
                      { month: '1', height: 45 },
                      { month: '2', height: 75 },
                      { month: '3', height: 60 },
                      { month: '4', height: 90 },
                      { month: '5', height: 80 },
                      { month: '6', height: 65 },
                      { month: '7', height: 100, active: true },
                      { month: '8', height: 70 },
                      { month: '9', height: 55 },
                      { month: '10', height: 48 },
                      { month: '11', height: 78 },
                      { month: '12', height: 52 },
                    ].map(bar => (
                      <div key={bar.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, flex: 1 }}>
                        <div
                          style={{
                            width: '36px',
                            height: `${bar.height * 1.6}px`,
                            borderRadius: '8px',
                            background: bar.active
                              ? 'repeating-linear-gradient(45deg, #facc15, #facc15 10px, #eab308 10px, #eab308 20px)'
                              : 'repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 8px, #cbd5e1 8px, #cbd5e1 16px)',
                            boxShadow: bar.active ? '0 8px 20px rgba(250, 204, 21, 0.4)' : 'none',
                            opacity: bar.active ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: bar.active ? 800 : 500,
                          background: bar.active ? '#18181b' : 'transparent',
                          padding: bar.active ? '2px 8px' : '0',
                          borderRadius: '10px',
                          color: bar.active ? '#ffffff' : '#94a3b8'
                        }}>
                          {bar.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Events Log Table */}
                {metrics && metrics.recent_events.length > 0 && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
                  }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                      Recent Audit Events Log
                    </h2>
                    <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', marginBottom: 0 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Entity ID</th>
                            <th>Actor</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.recent_events.map((ev, i) => (
                            <tr key={i}>
                              <td>
                                <span className="badge badge-info">
                                  {String(ev.type || ev.actor_role || 'EVENT')}
                                </span>
                              </td>
                              <td className="mono" style={{ fontWeight: 600, color: '#0f172a' }}>
                                {String(ev.entity_id || ev.batch_id || '—')}
                              </td>
                              <td style={{ fontWeight: 500 }}>{String(ev.actor_name || ev.from_actor || 'System')}</td>
                              <td className="mono">
                                {String(ev.timestamp ? new Date(ev.timestamp as string).toLocaleString() : 'Just now')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Right Secondary Sidebar Column ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Top Warm Golden Accent Card ("System Operational Health") */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 8px 25px -4px rgba(250, 204, 21, 0.35)',
                  border: '1px solid #facc15'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Active Network Health
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                    {metrics ? `${metrics.in_transit} In Transit` : 'Operational'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '20px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803d' }} />
                    Blockchain Ledgers & Nodes Active
                  </div>

                  <a
                    href="/batches"
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <IconPlus size={14} color="#0f172a" />
                    + Manage Batches
                  </a>
                </div>

                {/* Channel / Stakeholder Mix Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
                    Supply Chain Status Breakdown
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                    {/* Item 1 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#818cf8' }} />
                          Total Active Batches
                        </span>
                        <span style={{ color: '#16a34a' }}>{metrics ? metrics.total_batches : 0} units</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #818cf8, #6366f1)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22c55e' }} />
                          Batches In Transit
                        </span>
                        <span style={{ color: '#16a34a' }}>{metrics ? metrics.in_transit : 0} active</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: metrics && metrics.total_batches ? `${Math.min(100, Math.round((metrics.in_transit / metrics.total_batches) * 100))}%` : '40%', height: '100%', background: '#22c55e', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#dc2626' }} />
                          Quarantined / Incidents
                        </span>
                        <span style={{ color: metrics && (metrics.quarantined > 0 || metrics.open_incidents > 0) ? '#dc2626' : '#16a34a' }}>
                          {metrics ? metrics.quarantined + metrics.open_incidents : 0} items
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: metrics && metrics.total_batches ? `${Math.min(100, Math.round(((metrics.quarantined + metrics.open_incidents) / metrics.total_batches) * 100))}%` : '5%', height: '100%', background: '#dc2626', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <IconActivity size={14} color="#64748b" />
                        Custody Transfers
                      </span>
                      <span style={{ fontWeight: 800 }}>{metrics ? metrics.total_custody_transfers : 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <IconShield size={14} color="#64748b" />
                        Public QR Scans
                      </span>
                      <span style={{ fontWeight: 800 }}>{metrics ? metrics.total_scans : 0}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </AuthGuard>
  );
}



