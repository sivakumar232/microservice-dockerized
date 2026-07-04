import { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Eye, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-purple',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (v) => `$${Number(v).toFixed(2)}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders(statusFilter ? { status: statusFilter } : {});
      setOrders(res.data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const viewOrder = async (id) => {
    try {
      const res = await orderService.getOrderById(id);
      setSelectedOrder(res.data.data);
      setShowDetail(true);
    } catch { toast.error('Failed to load order details'); }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await orderService.updateStatus(id, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  const getAddress = (raw) => {
    try {
      const a = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return `${a.street}, ${a.city}, ${a.state} ${a.zip}`;
    } catch { return raw || 'N/A'; }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
      </div>

      <div className="page-content">
        {/* Filter Bar */}
        <div className="filters-bar">
          <select className="form-select" style={{ width: 200 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <h3>No orders yet</h3>
            <p>Orders will appear here once placed</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><span style={{ fontWeight: 700 }}>#{order.id.toString().padStart(4, '0')}</span></td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(order.total_amount)}</td>
                    <td>
                      {user?.role === 'admin' ? (
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`badge ${STATUS_MAP[order.status] || 'badge-gray'}`}>{order.status}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : order.payment_status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(order.created_at)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => viewOrder(order.id)}>
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDetail(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <div className="modal-title">Order #{selectedOrder.id?.toString().padStart(4, '0')}</div>
              <button className="modal-close" onClick={() => setShowDetail(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4 }}>STATUS</div>
                <span className={`badge ${STATUS_MAP[selectedOrder.status] || 'badge-gray'}`}>{selectedOrder.status}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4 }}>TOTAL</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--success)' }}>{formatCurrency(selectedOrder.total_amount)}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4 }}>PAYMENT</div>
                <span className={`badge ${selectedOrder.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{selectedOrder.payment_status}</span>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div className="text-xs text-muted" style={{ marginBottom: 4 }}>DATE</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(selectedOrder.created_at)}</div>
              </div>
            </div>

            <div className="form-label" style={{ marginBottom: 8 }}>Shipping Address</div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              {getAddress(selectedOrder.shipping_address)}
            </div>

            <div className="form-label" style={{ marginBottom: 12 }}>Order Items</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                  {item.product_image && (
                    <img src={item.product_image} alt={item.product_name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Qty: {item.quantity} × {formatCurrency(item.unit_price)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{formatCurrency(item.total_price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
