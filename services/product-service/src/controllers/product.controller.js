const { pool } = require('../config/db');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const categoryId = req.query.category || null;

    let query = `
      SELECT p.*, c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE AND (p.name LIKE ? OR p.description LIKE ?)
    `;
    const params = [search, search];

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    const countQuery = categoryId
      ? 'SELECT COUNT(*) as total FROM products WHERE is_active = TRUE AND category_id = ?'
      : 'SELECT COUNT(*) as total FROM products WHERE is_active = TRUE';
    const countParams = categoryId ? [categoryId] : [];
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  const { category_id, name, description, price, stock_quantity, sku, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (category_id, name, description, price, stock_quantity, sku, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, stock_quantity || 0, sku, image_url]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Product created', data: newProduct[0] });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const { category_id, name, description, price, stock_quantity, sku, image_url, is_active } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await pool.query(
      'UPDATE products SET category_id=?, name=?, description=?, price=?, stock_quantity=?, sku=?, image_url=?, is_active=? WHERE id=?',
      [category_id, name, description, price, stock_quantity, sku, image_url, is_active ?? true, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Product updated', data: updated[0] });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/products/:id (admin - soft delete)
const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/categories (admin)
const createCategory = async (req, res) => {
  const { name, description, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description, image_url]
    );

    const [newCat] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Category created', data: newCat[0] });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/products/:id/stock (admin - update stock)
const updateStock = async (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Quantity is required' });
  }

  try {
    await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, req.params.id]);
    const [updated] = await pool.query('SELECT id, name, stock_quantity FROM products WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Stock updated', data: updated[0] });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories, createCategory, updateStock };
