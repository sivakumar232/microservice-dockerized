import { useState, useEffect } from 'react';
import { productService, orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, ShoppingCart, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const formatCurrency = (v) => `$${Number(v).toFixed(2)}`;

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '', sku: '', image_url: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search, category: selectedCategory });
      setProducts(res.data.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    productService.getCategories().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, selectedCategory]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '', sku: '', image_url: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity, category_id: p.category_id || '', sku: p.sku || '', image_url: p.image_url || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, form);
        toast.success('Product updated!');
      } else {
        await productService.create(form);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  const handleAddToCart = async (p) => {
    try {
      await orderService.addToCart({
        product_id: p.id,
        product_name: p.name,
        product_image: p.image_url,
        quantity: 1,
        unit_price: p.price,
      });
      toast.success(`${p.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products available</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="filters-bar">
          <div className="search-bar" style={{ flex: 1, maxWidth: 340 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <div className="product-card" key={p.id}>
                <img
                  className="product-card-img"
                  src={p.image_url || 'https://via.placeholder.com/400x200/16161f/6c63ff?text=No+Image'}
                  alt={p.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x200/16161f/6c63ff?text=No+Image'; }}
                />
                <div className="product-card-body">
                  <div className="product-card-category">{p.category_name || 'Uncategorized'}</div>
                  <div className="product-card-name">{p.name}</div>
                  <div className="product-card-price">{formatCurrency(p.price)}</div>
                  <div className="product-card-stock">
                    <span style={{ color: p.stock_quantity > 10 ? 'var(--success)' : p.stock_quantity > 0 ? 'var(--warning)' : 'var(--danger)' }}>
                      {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <div className="product-card-footer">
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleAddToCart(p)} disabled={p.stock_quantity === 0}>
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Qty</label>
                  <input className="form-input" type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PROD-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
