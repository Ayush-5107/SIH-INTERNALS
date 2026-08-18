'use client';
import { useState } from 'react';
import { submitConsumerFeedback, verifyInnerCredential } from '@/lib/api';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import '../app.css';

const CATEGORIES = ['Spoilage', 'Contamination', 'Mislabeling', 'Packaging Damage', 'Foreign Object', 'Other'];

interface FeedbackResult { status: string; incidentId: string; ipfsCid: string; message: string; }

export default function FeedbackPage() {
  const [form, setForm] = useState({ credential: '', category: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.credential.trim() || !form.category || !form.description.trim()) {
      setError('Secret Code, Category, and Description are strictly required.');
      return;
    }
    setSubmitting(true);
    setError('');
    
    try {
      const verifyData = await verifyInnerCredential(form.credential.trim());
      if (!verifyData.isAuthentic) {
        setError('Invalid or tampered secret code. Cannot submit report for unverified products.');
        setSubmitting(false);
        return;
      }

      const res = await submitConsumerFeedback({
        unitId: form.credential.trim(),
        category: form.category,
        description: form.description,
      });
      setResult(res);
    } catch {
      setError('Failed to submit feedback. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
        <a href="/" style={{ color: '#0f172a', fontWeight: 900, fontSize: '18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef08a', border: '1px solid #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#d97706" />
          </div>
          FoodTrace Consumer Portal
        </a>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/track" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Track QR</a>
          <a href="/login" style={{ color: '#0f172a', background: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #facc15 100%)', border: '1px solid #facc15', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)' }}>
            Sign In <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '22px', background: '#fee2e2', border: '2px solid #ef4444', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.25)' }}>
            <ShieldAlert size={36} color="#b91c1c" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Report a Food Safety Issue
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto', fontWeight: 500 }}>
            Your complaint is immediately hashed to IPFS, stored immutably, and escalated to the responsible organization and food safety regulator.
          </p>
        </div>

        {result ? (
          <div>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <CheckCircle2 size={56} color="#059669" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#064e3b', marginBottom: '8px' }}>Report Submitted Successfully</h2>
              <p style={{ color: '#047857', fontSize: '14px', marginBottom: '24px', fontWeight: 500 }}>{result.message}</p>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontFamily: 'var(--mono)', fontSize: '13px', textAlign: 'left' }}>
                <div style={{ color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Incident ID</div>
                <div style={{ color: '#0f172a', marginBottom: '12px', fontWeight: 700 }}>{result.incidentId}</div>
                <div style={{ color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>IPFS CID</div>
                <div style={{ color: '#d97706', wordBreak: 'break-all', fontWeight: 700 }}>{result.ipfsCid}</div>
              </div>
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', color: '#1e40af', fontSize: '13px', fontWeight: 500, marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>Regulators have been notified. This report is permanently stored on the blockchain and cannot be deleted or modified.</div>
            </div>
            <button className="btn" style={{ width: '100%', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', height: '48px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }} onClick={() => { setResult(null); setForm({ credential: '', category: '', description: '' }); }}>
              Submit Another Report
            </button>
          </div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Inner Credential (Secret Code) *</label>
                <input id="feedback-credential" name="credential" required value={form.credential} onChange={handleChange} placeholder="e.g. SEC-1148-D" style={{ width: '100%', padding: '0 16px', height: '48px', fontSize: '14px', borderRadius: '10px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', fontFamily: 'var(--mono)' }} />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>Found scratched off inside the product seal. This is required to prevent fake reports.</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Issue Category *</label>
                <select id="feedback-category" name="category" required value={form.category} onChange={handleChange} style={{ width: '100%', padding: '0 16px', height: '48px', fontSize: '14px', borderRadius: '10px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a' }}>
                  <option value="">Select issue type…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Description *</label>
                <textarea
                  id="feedback-description"
                  name="description"
                  required
                  style={{ width: '100%', padding: '16px', minHeight: '120px', fontSize: '14px', borderRadius: '10px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Please describe the issue in detail. Include batch/product info if visible on packaging."
                />
              </div>

              <button id="feedback-submit" type="submit" disabled={submitting} style={{ width: '100%', height: '52px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', border: '1px solid #b91c1c', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting…' : <><ShieldAlert size={18} /> Submit Formal Report</>}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          <a href="/track" style={{ color: '#d97706', textDecoration: 'none' }}>← Back to Tracking</a>
        </p>
      </div>
    </div>
  );
}
