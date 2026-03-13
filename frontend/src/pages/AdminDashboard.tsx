import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IProduct } from '../types';

/**
 * Admin Dashboard — Product Management with Image Upload
 */
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', price: '', weight: '500g', description: '', stock: '50', category: 'pickle',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.data.products);
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setFormData({ name: '', price: '', weight: '500g', description: '', stock: '50', category: 'pickle' });
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use FormData for multipart upload (image)
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('price', formData.price);
      fd.append('weight', formData.weight);
      fd.append('description', formData.description);
      fd.append('stock', formData.stock);
      fd.append('category', formData.category);
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setToast({ type: 'success', message: 'Product updated!' });
      } else {
        await api.post('/admin/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setToast({ type: 'success', message: 'Product created!' });
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleEdit = (p: IProduct) => {
    setFormData({
      name: p.name,
      price: String(p.price),
      weight: p.weight,
      description: p.description,
      stock: String(p.stock || 0),
      category: p.category || 'pickle',
    });
    setEditingId(p.id);
    setShowForm(true);
    setImageFile(null);
    setImagePreview(p.image || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setToast({ type: 'success', message: 'Product deactivated.' });
      fetchProducts();
    } catch (err: any) {
      setToast({ type: 'error', message: 'Failed to delete.' });
    }
  };

  const getStockBadge = (stock: number | undefined) => {
    const s = stock ?? 0;
    if (s === 0) return <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-black uppercase">Out of Stock</span>;
    if (s <= 10) return <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase">Low Stock ({s})</span>;
    return <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">In Stock ({s})</span>;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] animate-fade-up">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold ${
            toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tighter">
            Admin<span className="text-emerald-400">Panel</span>
          </h1>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            {user?.role}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="glass-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            ← Store
          </button>
          <button onClick={logout} className="glass-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-400 transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black">Product Management</h2>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/25"
          >
            {showForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="glass-dark rounded-3xl p-8 mb-10 animate-fade-up">
            <h3 className="text-lg font-black mb-6">{editingId ? 'Edit Product' : 'Create New Product'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Product Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="500g Ginger Pickle" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Price (₹)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required min="1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="100" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Weight</label>
                <input type="text" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="500g" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Stock Quantity</label>
                <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="50" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm" placeholder="pickle" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 block">📷 Product Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-400 file:text-xs file:font-bold file:uppercase file:tracking-wider file:cursor-pointer hover:file:bg-emerald-500/30"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative inline-block">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-400">✕</button>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">JPEG, PNG, WebP, GIF • Max 5MB</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-sm resize-none" placeholder="A delicious homemade pickle..." />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/25">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 glass-dark rounded-3xl">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-400 font-bold">No products yet. Click "Add Product" to create one.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Image</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!p.isActive ? 'opacity-40' : ''}`}>
                    <td className="px-6 py-4">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl">🫙</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{p.weight} • {p.category}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-400">₹{p.price}</td>
                    <td className="px-6 py-4">{getStockBadge(p.stock)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
