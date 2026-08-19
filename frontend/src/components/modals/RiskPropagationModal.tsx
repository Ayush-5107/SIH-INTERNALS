import React, { useEffect, useState } from 'react';
import { propagateRisk } from '@/lib/api';

interface RiskNode { id: string; type: string; label: string; state: string; org_id: string }
interface RiskEdge { source: string; target: string; relation: string }
interface RiskLocation {
  latitude: number; longitude: number; location_name: string;
  timestamp: string; batch_id: string; event_type: string;
  actor_msp?: string; block_number?: string; transaction_id?: string;
}
interface RiskResult {
  source_batch_id: string;
  direction: string;
  affected_organizations: string[];
  affected_locations: RiskLocation[];
  nodes: RiskNode[];
  edges: RiskEdge[];
  risk_level: string;
}

const STATE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  REGISTERED:  { bg: '#f0fdf4', border: '#16a34a', text: '#15803d' },
  PROCESSED:   { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
  IN_TRANSIT:  { bg: '#fefce8', border: '#ca8a04', text: '#a16207' },
  RECEIVED:    { bg: '#f5f3ff', border: '#7c3aed', text: '#6d28d9' },
  BLOCKED:     { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c' },
  UNKNOWN:     { bg: '#f8fafc', border: '#94a3b8', text: '#64748b' },
};

function TreeNode({ node, isSource }: { node: RiskNode; isSource: boolean }) {
  const color = STATE_COLORS[node.state] || STATE_COLORS.UNKNOWN;
  const shortId = node.id.length > 22 ? node.id.substring(0, 20) + '…' : node.id;
  return (
    <div style={{
      background: isSource ? '#0f172a' : color.bg,
      border: `2px solid ${isSource ? '#ef4444' : color.border}`,
      borderRadius: '10px',
      padding: '10px 14px',
      minWidth: '180px',
      maxWidth: '220px',
      position: 'relative',
    }}>
      {isSource ? (
        <div style={{ color: '#ef4444', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          SOURCE BATCH
        </div>
      ) : (
        <div style={{ fontSize: '9px', fontWeight: 700, color: color.text, marginBottom: '2px' }}>
          NODE
        </div>
      )}
      <div style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: isSource ? '#f1f5f9' : '#0f172a', marginBottom: '5px', wordBreak: 'break-all' }}>{shortId}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ background: isSource ? '#1e293b' : color.border, color: isSource ? '#f1f5f9' : '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', display: 'inline-block' }}>{node.state}</span>
      </div>
      <div style={{ fontSize: '10px', color: isSource ? '#94a3b8' : '#64748b', marginTop: '4px' }}>{node.org_id?.split('-').slice(0, 2).join('-') || 'Org'}</div>
    </div>
  );
}

function buildLevels(nodes: RiskNode[], edges: RiskEdge[], sourceId: string, direction: string) {
  // BFS to assign depth levels relative to source
  const levels: Map<string, number> = new Map();
  const childrenMap: Map<string, string[]> = new Map();
  const parentMap: Map<string, string[]> = new Map();

  edges.forEach(e => {
    if (!childrenMap.has(e.source)) childrenMap.set(e.source, []);
    childrenMap.get(e.source)!.push(e.target);
    if (!parentMap.has(e.target)) parentMap.set(e.target, []);
    parentMap.get(e.target)!.push(e.source);
  });

  levels.set(sourceId, 0);
  // BFS downstream (children = positive levels)
  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  while (queue.length) {
    const curr = queue.shift()!;
    const children = childrenMap.get(curr) || [];
    children.forEach(c => {
      if (!visited.has(c)) {
        visited.add(c);
        levels.set(c, (levels.get(curr) || 0) + 1);
        queue.push(c);
      }
    });
  }
  // BFS upstream (parents = negative levels)
  const queue2: string[] = [sourceId];
  const visited2 = new Set<string>([sourceId]);
  while (queue2.length) {
    const curr = queue2.shift()!;
    const parents = parentMap.get(curr) || [];
    parents.forEach(p => {
      if (!visited2.has(p)) {
        visited2.add(p);
        levels.set(p, (levels.get(curr) || 0) - 1);
        queue2.push(p);
      }
    });
  }

  // Filter nodes based on selected direction
  const byLevel: Map<number, RiskNode[]> = new Map();
  nodes.forEach(n => {
    const level = levels.get(n.id) ?? 0;
    if (direction === 'UPSTREAM' && level > 0) return;
    if (direction === 'DOWNSTREAM' && level < 0) return;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(n);
  });

  const sortedLevels = Array.from(byLevel.entries()).sort((a, b) => a[0] - b[0]);
  return sortedLevels;
}

export default function RiskPropagationModal({ batchId, onClose }: { batchId: string, onClose: () => void }) {
  const [direction, setDirection] = useState('BOTH');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRisk(); }, [batchId, direction]);

  async function fetchRisk() {
    setLoading(true);
    try {
      const res = await propagateRisk({ source_batch_id: batchId, direction, risk_level: 'HIGH', reason: 'User triggered lineage investigation' });
      setResult(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div className="risk-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="risk-modal-content">
        {/* Header */}
        <div className="risk-modal-header">
          <div className="risk-modal-title-group">
            <div className="risk-modal-icon">$</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Risk Propagation Trace</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{batchId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="segmented-control">
              {['BOTH', 'UPSTREAM', 'DOWNSTREAM'].map(d => (
                <button key={d} className={`segment-btn ${direction === d ? 'active' : ''}`} onClick={() => setDirection(d)}>{d}</button>
              ))}
            </div>
            <button className="risk-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="risk-modal-body">
          {loading ? (
            <div className="loading" style={{ minHeight: '300px' }}>Tracing lineage graph…</div>
          ) : result ? (
            <>
              {/* TREE GRAPH */}
              <div className="risk-section-box" style={{ marginBottom: '16px', overflowX: 'auto' }}>
                <div className="risk-section-header" style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Supply Chain Lineage Tree ({direction === 'BOTH' ? 'Full Upstream & Downstream' : direction === 'UPSTREAM' ? 'Upstream Trace Only' : 'Downstream Trace Only'})
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{(result.nodes || []).length} nodes · {(result.edges || []).length} edges</span>
                </div>
                {(result.nodes || []).length > 0 ? (() => {
                  const levels = buildLevels(result.nodes || [], result.edges || [], result.source_batch_id, direction);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                      {levels.map(([level, levelNodes], li) => (
                        <div key={level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                          {/* Level label */}
                          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            {level < 0 ? `⬆ Upstream Stage L${Math.abs(level)} (Farms & Inputs)` : level === 0 ? '⚠ Source Batch (Incident Focal Point)' : `⬇ Downstream Stage L${level} (Transit & Retail)`}
                          </div>
                          {/* Nodes in this level */}
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {levelNodes.map(node => (
                              <TreeNode key={node.id} node={node} isSource={node.id === result.source_batch_id} />
                            ))}
                          </div>
                          {/* Connector line to next level */}
                          {li < levels.length - 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
                              <div style={{ width: '2px', height: '20px', background: 'linear-gradient(to bottom, #cbd5e1, #94a3b8)', borderRadius: '2px' }}/>
                              <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M6 8L0 0h12L6 8z" fill="#94a3b8"/></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })() : <div className="empty-state">No nodes found in {direction.toLowerCase()} trace.</div>}
              </div>

              {/* AFFECTED ORGANIZATIONS */}
              <div className="risk-section-box">
                <div className="risk-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    Affected Organizations
                  </div>
                  <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '18px' }}>{(result.affected_organizations || []).length}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(result.affected_organizations || []).map(org => (
                    <div key={org} className="org-pill">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      {org}
                    </div>
                  ))}
                  {!(result.affected_organizations || []).length && <div className="empty-state">No organizations affected</div>}
                </div>
              </div>

              {/* LOCATION TIMELINE */}
              <div className="risk-section-box">
                <div className="risk-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    Contamination Spread — Location Timeline
                  </div>
                </div>
                <div className="timeline">
                  {result.affected_locations?.map((loc, i) => {
                    const isFirst = i === 0;
                    const isLast = i === result.affected_locations.length - 1;
                    const dotBg = isFirst ? '#dcfce7' : isLast ? '#fee2e2' : '#e0f2fe';
                    const dotBorder = isFirst ? '#16a34a' : isLast ? '#ef4444' : '#0ea5e9';
                    return (
                      <div className="timeline-item" key={i}>
                        <div className="timeline-dot" style={{ background: dotBg, borderColor: dotBorder }}>
                          {isFirst ? '✓' : isLast ? '!' : '↗'}
                        </div>
                        <div className="timeline-content">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <span className="timeline-title">{loc.location_name}</span>
                            <span className="badge badge-muted" style={{ fontSize: '9px', padding: '2px 7px' }}>{loc.event_type}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🕐 {loc.timestamp ? new Date(loc.timestamp).toLocaleString() : 'N/A'}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>⬡ {loc.batch_id}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>🔗 {loc.transaction_id ? `tx-${String(loc.transaction_id).substring(0, 8)}…` : 'N/A'}</span>
                            <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}>
                              Block #{loc.block_number || '?'} · {loc.actor_msp || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!result.affected_locations?.length) && <div className="empty-state">No location events in trace.</div>}
                </div>
              </div>
            </>
          ) : <div className="empty-state">No data available</div>}
        </div>
      </div>
    </div>
  );
}

