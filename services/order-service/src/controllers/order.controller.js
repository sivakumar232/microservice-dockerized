const { pool } = require('../config/db');

// GET /api/orders/cart (user's cart)
const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    res.status(200).json({ success: true, data: { items, total: parseFloat(total.toFixed(2)) } });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/orders/cart (add to cart)
const addToCart = async (req, res) => {
  const { product_id, product_name, product_image, quantity, unit_price } = req.body;

  if (!product_id || !product_name || !unit_price) {
    return res.status(400).json({ success: false, message: 'Product details required' });
  }

  try {
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, product_name, product_image, quantity, unit_price)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, product_name, product_image, quantity || 1, unit_price]
    );

    const [item] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    res.status(200).json({ success: true, message: 'Added to cart', data: item[0] });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/orders/cart/:productId (update quantity)
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.id, req.params.productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/orders/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/orders (place order)
const placeOrder = async (req, res) => {
  const { shipping_address, payment_method, notes, items } = req.body;

  if (!shipping_address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Shipping address and items are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const total_amount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, total_amount.toFixed(2), JSON.stringify(shipping_address), payment_method || 'cod', notes]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.product_image, item.quantity, item.unit_price, (item.unit_price * item.quantity).toFixed(2)]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { ...order[0], items: orderItems },
    });
  } catch (err) {
    await connection.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

// GET /api/orders (user's orders or all for admin)
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query, params;
    if (req.user.role === 'admin') {
      query = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params = [limit, offset];
    } else {
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params = [req.user.id, limit, offset];
    }

    const [rows] = await pool.query(query, params);

    const countQuery = req.user.role === 'admin'
      ? 'SELECT COUNT(*) as total FROM orders'
      : 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = req.user.role === 'admin' ? [] : [req.user.id];
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    if (req.user.id !== order.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    res.status(200).json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updates = [];
    const params = [];
    if (status) { updates.push('status = ?'); params.push(status); }
    if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status); }
    params.push(req.params.id);

    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Order status updated', data: updated[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/orders/stats (admin)
const getOrderStats = async (req, res) => {
  try {
    const [[totalRevenue]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'"
    );
    const [[totalOrders]] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const [statusBreakdown] = await pool.query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');
    const [recentOrders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    const [monthlyRevenue] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.total),
        totalOrders: totalOrders.total,
        statusBreakdown,
        recentOrders,
        monthlyRevenue,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, placeOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats };
