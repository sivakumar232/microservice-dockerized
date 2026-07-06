import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        // Log them back out immediately
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        triggerShake();
        toast.error('Access denied. Admin accounts only.', {
          icon: '🚫',
          duration: 4000,
        });
        return;
      }
      toast.success(`Welcome, ${user.name}! 🛡️`, { duration: 3000 });
      navigate('/dashboard');
    } catch (err) {
      triggerShake();
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      {/* Animated background */}
      <div className="admin-bg-blob blob-1" />
      <div className="admin-bg-blob blob-2" />
      <div className="admin-bg-blob blob-3" />

      {/* Grid overlay */}
      <div className="admin-grid-overlay" />

      <div className={`admin-auth-card animate-fadeIn ${shake ? 'admin-shake' : ''}`}>

        {/* Top warning bar */}
        <div className="admin-warning-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Restricted Area — Authorized Personnel Only
        </div>

        {/* Shield icon + branding */}
        <div className="admin-logo-area">
          <div className="admin-shield-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div>
            <h1 className="admin-title">Admin Portal</h1>
            <p className="admin-subtitle">ShopFlow Control Center</p>
          </div>
        </div>

        {/* Credential hint */}
        <div className="admin-hint-box">
          <span className="admin-hint-label">Demo Credentials</span>
          <code className="admin-hint-cred">admin@shopflow.com</code>
          <code className="admin-hint-cred">Admin@123</code>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,220,180,0.7)' }}>
              Admin Email
            </label>
            <div className="admin-input-wrapper">
              <svg className="admin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="admin-email"
                className="admin-input"
                type="email"
                placeholder="admin@shopflow.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(255,220,180,0.7)' }}>
              Password
            </label>
            <div className="admin-input-wrapper">
              <svg className="admin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="admin-password"
                className="admin-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#ff9a3c' }} />
                Authenticating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        {/* Back to user login */}
        <div className="admin-back-link">
          <Link to="/login">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to User Login
          </Link>
        </div>

      </div>
    </div>
  );
}
