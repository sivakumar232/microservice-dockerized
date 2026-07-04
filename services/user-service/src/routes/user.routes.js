const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAddresses, addAddress, deleteAddress, getAllUsers } = require('../controllers/user.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// User profile routes
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.get('/:id/addresses', getAddresses);
router.post('/:id/addresses', addAddress);
router.delete('/:id/addresses/:addressId', deleteAddress);

module.exports = router;
