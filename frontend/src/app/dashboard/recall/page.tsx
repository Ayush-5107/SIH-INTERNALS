'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import styles from './page.module.css';
import { IconShield } from '@/components/icons/Icons';

function RecallContent() {
  const searchParams = useSearchParams();
  const queryBatchId = searchParams.get('batch_id') || '';

  const [batches, setBatches] = useState<any[]>([]);
  const [targetBatch, setTargetBatch] = useState(queryBatchId);
  
  const [propagating, setPropagating] = useState(false);
  const [propagateResult, setPropagateResult] = useState<any | null>(null);

  const [recalling, setRecalling] = useState(false);
  const [recallResult, setRecallResult] = useState<any | null>(null);

  // Fetch all batches on mount to populate select list
  useEffect(() => {
    const fetchBatchesData = async () => {
      try {
        const res = await apiClient.get('/dashboard/batches');
        setBatches(res.data || []);
        if (!targetBatch && res.data && res.data.length > 0) {
          setTargetBatch(res.data[0].batch_id);
        }
      } catch (err) {
        console.error('Failed to load operational batches:', err);
      }
    };
    fetchBatchesData();
  }, []);

  // Sync with search parameter if it updates
  useEffect(() => {
    if (queryBatchId) {
      setTargetBatch(queryBatchId);
    }
  }, [queryBatchId]);

  // Run risk propagation
  const handlePropagate = async () => {
    if (!targetBatch) return;
    try {
      setPropagating(true);
      setRecallResult(null);
      const res = await apiClient.post('/risk/propagate', {
        source_batch_id: targetBatch,
        direction: 'BOTH',
      });
      setPropagateResult(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Risk propagation query failed.');
    } finally {
      setPropagating(false);
    }
  };

  // Automatically propagate when targetBatch changes
  useEffect(() => {
    if (targetBatch) {
      handlePropagate();
    }
  }, [targetBatch]);

  // Execute Targeted Recall
  const handleExecuteRecall = async () => {
    if (!targetBatch) return;

    const affectedIds = [targetBatch];
    if (propagateResult && propagateResult.affected_batches) {
      propagateResult.affected_batches.forEach((b: any) => {
        if (b.batch_id !== targetBatch) affectedIds.push(b.batch_id);
      });
    }

    try {
      setRecalling(true);
      const res = await apiClient.post('/recall/recalls', {
        affected_batch_ids: affectedIds,
        reason: `Targeted regulatory quarantine containment broadcast issued for lot ${targetBatch}`,
      });
      setRecallResult(res.data);
      alert(`On-chain recall lockdown executed!\nQuarantined ${affectedIds.length} batches.\nTx ID: ${res.data.blockchain_tx_id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Recall transaction broadcast failed.');
    } finally {
      setRecalling(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Targeted Recall Command & Risk Propagator</h1>
          <p className={styles.pageSubtitle}>
            Graph-based blast radius isolation, forward supply chain dependency tracing, and automated POS shelf lockouts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn--danger"
            onClick={handleExecuteRecall}
            disabled={recalling || !targetBatch}
          >
            {recalling ? 'Executing...' : '🚨 Execute On-Chain Recall Lockdown'}
          </button>
        </div>
      </div>

      {/* ── Status Metrics Strip ──────────────────────────────── */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Affected Batches</span>
          <span className={styles.metricVal} style={{ color: 'var(--color-danger)' }}>
            {propagateResult ? propagateResult.total_affected_batches : 0}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quarantine Blast Radius</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Consensus State</span>
          <span className={styles.metricVal} style={{ color: recallResult ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {recallResult ? 'RECALLED' : 'NOMINAL'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fabric Ledger Status</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Affected Org Nodes</span>
          <span className={styles.metricVal}>
            {propagateResult && propagateResult.affected_batches
              ? Array.from(new Set(propagateResult.affected_batches.map((b: any) => b.current_custodian_org_id))).length
              : 0}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Downstream Stakeholders</span>
        </div>
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Audit Trail Hash</span>
          <span className={styles.metricVal} style={{ fontSize: '12px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {recallResult ? recallResult.blockchain_tx_id.substring(0, 16) + '...' : 'SECURE_RAFT_ORDERER'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Consensus Signature</span>
        </div>
      </div>

      {/* ── DAG Simulation Grid ───────────────────────────────── */}
      <div className={styles.dagGrid}>
        {/* Left: Query Panel */}
        <div className={styles.controlPanel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconShield size={16} color="var(--color-danger)" />
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>Risk Propagator Query</h3>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Select an origin batch to trace forward Directed Acyclic Graph (DAG) dependencies across silos, logistics hubs, and retail outlets.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Root Lot / Batch ID</label>
            <select
              style={{
                height: '32px',
                padding: '0 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                background: 'var(--bg-subtle)',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
              value={targetBatch}
              onChange={(e) => {
                setTargetBatch(e.target.value);
                setRecallResult(null);
              }}
            >
              {batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.batch_id} ({b.product_id})
                </option>
              ))}
            </select>
          </div>

          {propagateResult && propagateResult.total_affected_batches > 0 ? (
            <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', borderRadius: '4px', padding: '10px', fontSize: '11.5px', color: 'var(--color-danger)' }}>
              <strong>Contamination Vector Confirmed:</strong> Forward DAG propagates risk to {propagateResult.total_affected_batches} derivative processing lots.
            </div>
          ) : (
            <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '4px', padding: '10px', fontSize: '11.5px', color: 'var(--color-success)' }}>
              <strong>Lineage Clean:</strong> Zero downstream cross-contamination detected.
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn--secondary"
              onClick={handlePropagate}
              disabled={propagating}
            >
              {propagating ? 'Calculating...' : 'Recalculate Blast Radius'}
            </button>
          </div>
        </div>

        {/* Right: Interactive DAG Graph */}
        <div className={styles.graphPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Directed Acyclic Graph (DAG) Forward Lineage Progression
            </span>
            <span style={{ fontSize: '11px', color: recallResult ? 'var(--color-danger)' : 'var(--text-muted)', fontWeight: 600 }}>
              {recallResult ? '● RECALL LOCKDOWN COMMITTED' : '● SIMULATING LIVE PATHWAY'}
            </span>
          </div>

          <div className={styles.dagCanvas}>
            {/* Origin Node */}
            <div className={`${styles.dagNode} ${styles.nodeInfected}`}>
              <span className={styles.nodeStage}>Root Batch Origin</span>
              <span className={styles.nodeName}>ID: {targetBatch}</span>
            </div>

            {/* Downstream Child Nodes */}
            {propagateResult &&
              propagateResult.affected_batches &&
              propagateResult.affected_batches.map((b: any) => {
                if (b.batch_id === targetBatch) return null;
                return (
                  <div key={b.batch_id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: 'var(--color-danger)', fontWeight: 800 }}>→</span>
                    <div className={`${styles.dagNode} ${styles.nodeInfected}`}>
                      <span className={styles.nodeStage}>Downstream lot</span>
                      <span className={styles.nodeName}>Custodian: {b.current_custodian_org_id.substring(0, 13)}...</span>
                      <span className={styles.nodeSub}>ID: {b.batch_id}</span>
                    </div>
                  </div>
                );
              })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Targeted Recall quarantines contaminated items without blanket product waste.</span>
            <span className="mono-num" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Channel: traceability-channel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecallPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Recall Console Workspace...
      </div>
    }>
      <RecallContent />
    </Suspense>
  );
}
