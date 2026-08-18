'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/shared/AuthGuard';
import AppNav from '@/components/shared/AppNav';
import { fetchProducts, createProduct } from '@/lib/api';
import { IconProducts } from '@/components/icons/Icons';
import '../app.css';

interface Product {
  id: string;
  name: string;
  category: string;
  gtin: string;
  manufacturer: string;
  date: string;
}

const CATEGORIES = ['Flour & Grains', 'Edible Oils', 'Natural Sweeteners', 'Dairy', 'Spices', 'Beverages', 'Processed Foods', 'Other'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', gtin: '', manufacturer: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.gtin || !form.manufacturer) {
      setMsg({ type: 'danger', text: 'All fields are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createProduct(form);
      const newProduct = res.product || res;
      if (newProduct?.id) {
        setProducts(prev => [newProduct, ...prev]);
        setMsg({ type: 'success', text: `Product ${newProduct.id} created successfully.` });
        setForm({ name: '', category: '', gtin: '', manufacturer: '' });
        setShowForm(false);
      } else {
        setMsg({ type: 'danger', text: 'Failed to create product.' });
      }
    } catch {
      setMsg({ type: 'danger', text: 'An error occurred.' });
    }
    setSubmitting(false);
  }

  return (
    <AuthGuard allowedRoles={['ADMIN', 'FARMER', 'PROCESSOR']}>
      <div className="app-page">
        <AppNav />
        <div className="app-container">
          <div className="page-header">
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.5px' }}>
                <IconProducts size={28} color="#eab308" /> Products
              </h1>
              <p className="page-subtitle">Registered food product definitions ({products.length} total)</p>
            </div>
            <button id="toggle-add-product" className="btn btn-primary" onClick={() => { setShowForm(v => !v); setMsg(null); }}>
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
          </div>

          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {showForm && (
            <div className="form-section">
              <h2 className="section-title">New Product</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input id="product-name" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="e.g. Organic Wheat Flour 5KG" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select id="product-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                      <option value="">Select category…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GTIN / Barcode *</label>
                    <input id="product-gtin" name="gtin" className="form-input" value={form.gtin} onChange={handleChange} placeholder="e.g. 8901234567890" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manufacturer *</label>
                    <input id="product-manufacturer" name="manufacturer" className="form-input" value={form.manufacturer} onChange={handleChange} placeholder="e.g. Sahyadri Agro" />
                  </div>
                </div>
                <button id="submit-product" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating…' : '✓ Create Product'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products found. Create one above.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>GTIN</th>
                    <th>Manufacturer</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="mono">{p.id}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><span className="badge badge-info">{p.category}</span></td>
                      <td className="mono">{p.gtin}</td>
                      <td>{p.manufacturer}</td>
                      <td className="mono">{p.date}</td>
                      <td>
                        <a href={`/products/${encodeURIComponent(p.id)}`} className="btn btn-ghost btn-sm">
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
