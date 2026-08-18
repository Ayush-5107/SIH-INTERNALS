'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, USER_REGISTRY, type RegisteredUser } from '@/lib/auth';
import '../app.css';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const ok = login(form.username.trim(), form.password, '');
    if (!ok) {
      setError('Invalid username or password. Use a quick-login card below.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  }

  function quickLogin(user: RegisteredUser) {
    login(user.username, user.password, user.role);
    router.push('/dashboard');
  }

  const roleColor: Record<string, string> = {
    FARMER: 'var(--success)',
    PROCESSOR: 'var(--info)',
    PACKAGER: 'var(--warning)',
    DISTRIBUTOR: '#4f46e5',
    RETAILER: '#db2777',
    REGULATOR: '#7c3aed',
    ADMIN: 'var(--danger)',
  };

  const roleBg: Record<string, string> = {
    FARMER: 'var(--success-dim)',
    PROCESSOR: 'var(--info-dim)',
    PACKAGER: 'var(--warning-dim)',
    DISTRIBUTOR: '#e0e7ff',
    RETAILER: '#fce7f3',
    REGULATOR: '#f3e8ff',
    ADMIN: 'var(--danger-dim)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      fontFamily: 'var(--font)',
      color: 'var(--text)'
    }}>
      {/* Left — Login form */}
      <div style={{
        flex: '0 0 520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36.5px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'var(--primary-dim)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.12)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              FoodTrace
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>
              Food Supply Chain Intelligence Platform
            </p>
          </div>

          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow)'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>
              Sign In
            </h2>

            {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                  style={{ background: 'var(--surface2)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ background: 'var(--surface2)' }}
                />
              </div>
              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 18px', marginTop: '6px' }}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--muted)' }}>
            <a href="/" style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: 600 }}>← Landing Page</a>
            {' · '}
            <a href="/track" style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: 600 }}>Track QR (Public)</a>
          </p>
        </div>
      </div>

      {/* Right — Quick Login */}
      <div style={{ flex: 1, padding: '48px 64px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              ⚡ Quick Login Persona Portal
            </h2>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'var(--warning-dim)',
              color: 'var(--warning)',
              border: '1px solid rgba(217, 119, 6, 0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Demo Mode Console</span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '28px', lineHeight: 1.6 }}>
            Select an operational stakeholder identity card below to instantly access their corresponding dashboard environment and roles.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '36px'
          }}>
            {USER_REGISTRY.map(u => {
              const borderCol = roleColor[u.role] || 'var(--border)';
              const badgeBgCol = roleBg[u.role] || 'var(--bg)';
              const badgeTxtCol = roleColor[u.role] || 'var(--text)';
              return (
                <button
                  key={u.username}
                  id={`quick-login-${u.username}`}
                  onClick={() => quickLogin(u)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = borderCol;
                    e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: badgeBgCol,
                        color: badgeTxtCol,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14.5px',
                        border: `1px solid ${borderCol}22`,
                        flexShrink: 0
                      }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '14.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.org}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '2px',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: badgeTxtCol,
                          background: badgeBgCol,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, minHeight: '36px' }}>
                      {u.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--faint)', fontWeight: 600 }}>Credentials:</span>
                    <code style={{ fontSize: '11px', color: 'var(--info)', background: 'var(--info-dim)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {u.username}
                    </code>
                    <code style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {u.password}
                    </code>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chain flow diagram */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: 'var(--shadow)'
          }}>
            <p style={{
              fontSize: '11.5px',
              color: 'var(--muted)',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 700
            }}>
              Supply Chain Chain-of-Custody Progression
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {['Farmer', 'Processor', 'Packager', 'Distributor', 'Retailer', '→', 'Public (QR Scan)'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: step === '→' ? 'var(--faint)' : step.includes('Public') ? 'var(--success)' : 'var(--text)',
                    background: step === '→' || step.includes('Public') ? 'transparent' : 'var(--bg)',
                    padding: step === '→' ? '0' : '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    border: step === '→' || step.includes('Public') ? 'none' : '1px solid var(--border)'
                  }}>
                    {step}
                  </span>
                  {i < 5 && <span style={{ color: 'var(--faint)', fontSize: '14px', fontWeight: 800 }}>→</span>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.5 }}>
              The <strong style={{ color: 'var(--text)' }}>Retailer</strong> serves as the chain terminus. Once they accept custody, the batch resolves to <strong style={{ color: 'var(--success)' }}>ON_SHELF</strong>, permitting secure FSSAI verification & consumer QR lookup checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
