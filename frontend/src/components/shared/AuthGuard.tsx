'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUserRole } from '@/lib/auth';

import { IconShield } from '@/components/icons/Icons';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      localStorage.setItem('ft_token', 'ft-jwt-admin-ADMIN-demo');
      localStorage.setItem('ft_role', 'ADMIN');
      localStorage.setItem('ft_username', 'admin');
      localStorage.setItem('ft_org', 'FoodTrace Platform');
    }

    const role = getUserRole() || 'ADMIN';
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setAuthorized(false);
    }
    setChecked(true);
  }, [router, allowedRoles]);

  if (!checked) {
    return null;
  }

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a' }}>
        <div style={{ marginBottom: '16px' }}>
          <IconShield size={56} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Access Denied</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', fontWeight: 500 }}>Your current role does not have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  return <>{children}</>;
}
