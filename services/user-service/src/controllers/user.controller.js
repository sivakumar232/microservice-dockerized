const { pool } = require('../config/db');

// GET /api/users/:id
const getProfile = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);
    const profile = { ...rows[0], addresses };

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/users/:id
const updateProfile = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const { name, phone, avatar_url, date_of_birth } = req.body;

  try {
    // Check if profile exists
    const [existing] = await pool.query('SELECT id FROM profiles WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      // Create profile if not exists
      await pool.query(
        'INSERT INTO profiles (user_id, name, email, phone, avatar_url, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, name, req.user.email, phone, avatar_url, date_of_birth]
      );
    } else {
      await pool.query(
        'UPDATE profiles SET name = ?, phone = ?, avatar_url = ?, date_of_birth = ? WHERE user_id = ?',
        [name, phone, avatar_url, date_of_birth, userId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    res.status(200).json({ success: true, message: 'Profile updated', data: updated[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/users/:id/addresses
const getAddresses = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [userId]);
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/users/:id/addresses
const addAddress = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const { label, street, city, state, zip_code, country, is_default } = req.body;

  if (!street || !city || !state || !zip_code) {
    return res.status(400).json({ success: false, message: 'Street, city, state and zip_code are required' });
  }

  try {
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, label, street, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, label || 'Home', street, city, state, zip_code, country || 'India', is_default || false]
    );

    const [newAddress] = await pool.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Address added', data: newAddress[0] });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/users/:id/addresses/:addressId
const deleteAddress = async (req, res) => {
  const userId = parseInt(req.params.id);
  const addressId = parseInt(req.params.addressId);

  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM profiles');

    res.status(200).json({
      success: true,
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getProfile, updateProfile, getAddresses, addAddress, deleteAddress, getAllUsers };
