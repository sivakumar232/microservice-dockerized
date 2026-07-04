const express = require('express');
const router = express.Router();
const {
  getCart, addToCart, updateCartItem, removeFromCart,
  placeOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats
} = require('../controllers/order.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// All order routes require auth
router.use(verifyToken);

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart/:productId', updateCartItem);
router.delete('/cart/:productId', removeFromCart);

// Order routes
router.get('/stats', requireAdmin, getOrderStats);
router.get('/', getOrders);
router.post('/', placeOrder);
router.get('/:id', getOrderById);
router.patch('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
