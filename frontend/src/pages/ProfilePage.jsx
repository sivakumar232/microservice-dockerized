import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', avatar_url: '', date_of_birth: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', street: '', city: '', state: '', zip_code: '', country: 'India', is_default: false });

  useEffect(() => {
    if (!user?.id) return;
    userService.getProfile(user.id)
      .then(res => {
        const p = res.data.data;
        setProfile(p);
        setForm({ name: p.name || '', phone: p.phone || '', avatar_url: p.avatar_url || '', date_of_birth: p.date_of_birth?.split('T')[0] || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile(user.id, form);
      toast.success('Profile updated! ✅');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await userService.addAddress(user.id, addrForm);
      toast.success('Address added!');
      setShowAddrForm(false);
      setAddrForm({ label: 'Home', street: '', city: '', state: '', zip_code: '', country: 'India', is_default: false });
      const res = await userService.getProfile(user.id);
      setProfile(res.data.data);
    } catch { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await userService.deleteAddress(user.id, addrId);
      toast.success('Address removed');
      setProfile(prev => ({ ...prev, addresses: prev.addresses.filter(a => a.id !== addrId) }));
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 40, height: 40 }} />
      <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Profile Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--gradient-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'white'
            }}>
              {form.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{form.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
              <span className="badge badge-purple" style={{ marginTop: 4 }}>{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9000000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input className="form-input" value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={16} color="var(--accent-light)" /> Saved Addresses
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddrForm(!showAddrForm)}>
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddrForm && (
            <form onSubmit={handleAddAddress} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Label</label>
                <select className="form-select" value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Street *</label>
                <input className="form-input" value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className="form-input" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code *</label>
                <input className="form-input" value={addrForm.zip_code} onChange={e => setAddrForm({ ...addrForm, zip_code: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddrForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {profile?.addresses?.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <MapPin size={32} />
              <p>No addresses saved yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profile?.addresses?.map(addr => (
                <div key={addr.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{addr.label}</span>
                      {addr.is_default && <span className="badge badge-success" style={{ fontSize: 9 }}>Default</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.zip_code}<br />
                      {addr.country}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(addr.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
