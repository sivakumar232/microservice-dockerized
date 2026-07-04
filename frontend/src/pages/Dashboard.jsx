import { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, Package, DollarSign, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#a855f7',
  shipped: '#6c63ff',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#a855f7', '#6c63ff', '#22c55e', '#ef4444'];

const formatCurrency = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      color: 'var(--success)',
      bg: 'var(--success-dim)',
    },
    {
      icon: ShoppingCart,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'var(--accent-light)',
      bg: 'var(--accent-dim)',
    },
    {
      icon: Truck,
      label: 'Shipped',
      value: stats.statusBreakdown?.find(s => s.status === 'shipped')?.count || 0,
      color: '#3b82f6',
      bg: 'var(--info-dim)',
    },
    {
      icon: CheckCircle,
      label: 'Delivered',
      value: stats.statusBreakdown?.find(s => s.status === 'delivered')?.count || 0,
      color: 'var(--success)',
      bg: 'var(--success-dim)',
    },
  ] : [];

  const pieData = stats?.statusBreakdown?.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: Number(s.count),
  })) || [];

  const areaData = stats?.monthlyRevenue?.map(m => ({
    month: m.month,
    revenue: parseFloat(m.revenue),
    orders: m.orders,
  })) || [];

  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your store today</p>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="stats-grid">
              {statCards.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <s.icon size={20} color={s.color} />
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="chart-grid">
              {/* Area Chart */}
              <div className="chart-container">
                <div className="card-title" style={{ marginBottom: 20 }}>Revenue Overview</div>
                {areaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                        formatter={(v) => [`$${v}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6c63ff" strokeWidth={2} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <TrendingUp size={40} />
                    <p>No revenue data yet</p>
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="chart-container">
                <div className="card-title" style={{ marginBottom: 20 }}>Order Status</div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <ShoppingCart size={40} />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card" style={{ marginTop: 24 }}>
              <div className="flex justify-between items-center mb-4">
                <div className="card-title">Recent Orders</div>
              </div>
              {recentOrders.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }}>#{order.id.toString().padStart(4, '0')}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(order.total_amount)}</td>
                          <td>
                            <span className="badge" style={{
                              background: STATUS_COLORS[order.status] + '22',
                              color: STATUS_COLORS[order.status]
                            }}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : order.payment_status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <ShoppingCart size={40} />
                  <h3>No recent orders</h3>
                  <p>Orders will appear here once placed</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
