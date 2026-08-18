'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserName, getUserRole, clearToken } from '@/lib/auth';
import {
  IconOverview,
  IconProducts,
  IconBatches,
  IconUnitsQR,
  IconIncidents,
  IconEvents,
  IconTrack,
  IconFeedback,
  IconRisk,
  IconRecalls,
  IconSearch,
  IconBell,
  IconLogout,
  IconPlus,
  IconCalendar,
  IconChevronDown,
  BrandLogo
} from '@/components/icons/Icons';

interface NavLinkItem {
  href: string;
  label: string;
  IconComponent: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  roles: string[];
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '/dashboard', label: 'Dashboard', IconComponent: IconOverview, roles: ['ALL'] },
  { href: '/products', label: 'Products', IconComponent: IconProducts, roles: ['ADMIN', 'FARMER', 'PROCESSOR'] },
  { href: '/batches', label: 'Batches', IconComponent: IconBatches, roles: ['ALL'] },
  { href: '/units', label: 'Units', IconComponent: IconUnitsQR, roles: ['ADMIN', 'PACKAGER'] },
  { href: '/incidents', label: 'Incidents', IconComponent: IconIncidents, roles: ['ADMIN', 'REGULATOR', 'RETAILER'] },
  { href: '/events', label: 'Events', IconComponent: IconEvents, roles: ['ADMIN', 'REGULATOR'] },
  { href: '/track', label: 'Track QR', IconComponent: IconTrack, roles: ['ALL'] },
  { href: '/feedback', label: 'Feedback', IconComponent: IconFeedback, roles: ['ALL'] },
  { href: '/admin/risk', label: 'Risk Propagator', IconComponent: IconRisk, roles: ['ADMIN', 'REGULATOR'] },
  { href: '/admin/recalls', label: 'Issue Recalls', IconComponent: IconRecalls, roles: ['ADMIN', 'REGULATOR'] },
];

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  const username = getUserName();
  const role = getUserRole();

  return (
    <>
      {/* ── Left Sidebar (Floating White Column matching screenshot) ── */}
      <aside style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        bottom: '12px',
        width: '64px',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '20px',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Top Brand Logo Squircle */}
        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <BrandLogo size={20} color="#ffffff" />
          </div>
        </a>

        {/* Shortcuts Icon Stack */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          margin: 'auto 0'
        }}>
          {NAV_LINKS.filter(link => link.roles.includes('ALL') || link.roles.includes(role || '')).map(link => {
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            const Icon = link.IconComponent;
            return (
              <a
                key={link.href}
                href={link.href}
                title={link.label}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? '#18181b' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.12)' : 'none',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f4f6f8';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <Icon size={18} color="currentColor" strokeWidth={isActive ? 2 : 1.75} />
              </a>
            );
          })}
        </nav>

        {/* Bottom User Avatar & Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            title={`${username} (${role})`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#fef08a',
              color: '#0f172a',
              border: '2px solid #fde047',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <IconLogout size={16} color="currentColor" />
          </button>
        </div>
      </aside>

      {/* ── Top Header Bar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(244, 246, 248, 0.85)',
        backdropFilter: 'blur(8px)',
        height: '64px',
        padding: '0 24px 0 88px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Left: Search Bar with Glass SVG matching reference UI */}
        <div style={{ flex: '1', maxWidth: '360px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <IconSearch size={15} color="#94a3b8" />
          </span>
          <input
            type="text"
            placeholder="Search batches, products, logs..."
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '9px 16px 9px 38px',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.2s ease'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.15)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 6px -1px rgba(0, 0, 0, 0.02)';
            }}
          />
        </div>

        {/* Right: Sync Status + Actions (Last 30 days + Send message CTA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Sync indicator pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#16a34a',
            background: '#dcfce7',
            padding: '5px 12px',
            borderRadius: '20px',
            fontWeight: 700
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
            Synced just now
          </div>

          {/* Date Filter Dropdown matching image */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.02)'
          }}>
            <IconCalendar size={14} color="#64748b" />
            Last 30 days
            <IconChevronDown size={13} color="#94a3b8" />
          </button>

          {/* Primary Warm Yellow Action Button linking to /batches */}
          <a
            href="/batches"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)',
              color: '#0f172a',
              border: '1px solid #facc15',
              borderRadius: '12px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(250, 204, 21, 0.35)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
          >
            <IconPlus size={14} color="#0f172a" />
            New Batch
          </a>
        </div>
      </header>
    </>
  );
}



