'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import {
  IconSearch,
  IconBell,
  IconDownload,
} from '@/components/icons/Icons';

export type UserPersona = 'producer' | 'qa' | 'retailer' | 'logistics' | 'regulator' | 'admin';

interface PersonaMeta {
  id: UserPersona;
  name: string;
  roleTitle: string;
  orgName: string;
}

const PERSONAS: PersonaMeta[] = [
  { id: 'producer', name: 'Rakesh Patel', roleTitle: 'Plant Operations Lead', orgName: 'Sahyadri Agro' },
  { id: 'qa', name: 'Dr. Anita Sharma', roleTitle: 'Lead QA & Safety Inspector', orgName: 'National QA Labs' },
  { id: 'retailer', name: 'Vikram Mehta', roleTitle: 'Retail POS Manager', orgName: 'GreenBasket Retail' },
  { id: 'logistics', name: 'Rajesh Nair', roleTitle: 'Fleet & Cold-Chain Lead', orgName: 'AgriTransit Logistics' },
  { id: 'regulator', name: 'Sunil Deshmukh', roleTitle: 'FSSAI Regional Auditor', orgName: 'FSSAI MH Region' },
  { id: 'admin', name: 'Platform Admin', roleTitle: 'Hyperledger Node Operator', orgName: 'FoodTrace Core' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPersona, setCurrentPersona] = useState<UserPersona>('producer');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('foodtrace_active_role') as UserPersona;
      if (stored && PERSONAS.some((p) => p.id === stored)) {
        setCurrentPersona(stored);
      }
    }
  }, []);

  const handleSelectPersona = (id: UserPersona) => {
    setCurrentPersona(id);
    setShowPersonaMenu(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodtrace_active_role', id);
      window.dispatchEvent(new Event('foodtrace_role_changed'));
    }
  };

  const activeMeta = PERSONAS.find((p) => p.id === currentPersona) || PERSONAS[0];

  const handleExport = () => {
    const data = `FOODTRACE ENTERPRISE COMPLIANCE AUDIT EXPORT
Generated: ${new Date().toISOString()}
Operator: ${activeMeta.name} (${activeMeta.roleTitle} - ${activeMeta.orgName})
Active Persona: ${activeMeta.id.toUpperCase()}
Node: Hyperledger Fabric Mainnet Peer0 (Org1MSP)
Channel: foodtrace-mainnet-0 (Block #18,492)`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FoodTrace_Audit_${activeMeta.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/batches/${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className={styles.header}>
      {/* Search Command Input */}
      <div className={styles.leftGroup}>
        <form onSubmit={handleSearchSubmit} className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search batch ID, GTIN, product, custodian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.kbdBadge}>⌘K</span>
        </form>

        <div className={styles.networkPill}>
          <span style={{ color: '#059669' }}>●</span>
          <span>Block #18,492</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className={styles.rightGroup}>
        <button
          className={styles.iconButton}
          title="Active Alerts"
          onClick={() => (window.location.href = '/dashboard/incidents')}
        >
          <IconBell size={15} />
          <span className={styles.notifDot}></span>
        </button>

        <button className="btn btn--secondary" onClick={handleExport}>
          <IconDownload size={13} />
          <span>Export Audit</span>
        </button>

        {/* Persona Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            className={styles.userProfile}
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            title="Click to switch active role/persona"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
          >
            <div className={styles.avatarBox}>
              {activeMeta.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{activeMeta.name}</span>
              <span className={styles.userRole}>{activeMeta.roleTitle}</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>▾</span>
          </div>

          {showPersonaMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '6px',
                width: '240px',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                boxShadow: 'var(--shadow-md)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Switch Operational Persona
              </div>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  style={{
                    padding: '6px 8px',
                    textAlign: 'left',
                    borderRadius: '4px',
                    background: currentPersona === p.id ? 'var(--bg-subtle)' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.name} {currentPersona === p.id && '✓'}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {p.roleTitle} ({p.orgName})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
