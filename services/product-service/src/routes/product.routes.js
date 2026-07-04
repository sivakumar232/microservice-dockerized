const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProductById, createProduct, updateProduct,
  deleteProduct, getCategories, createCategory, updateStock
} = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);
router.patch('/:id/stock', verifyToken, requireAdmin, updateStock);
router.post('/categories', verifyToken, requireAdmin, createCategory);

module.exports = router;
