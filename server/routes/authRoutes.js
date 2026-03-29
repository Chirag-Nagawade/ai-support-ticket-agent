const express = require('express');
const { register, login, getAllStaff, updateStaff, deleteStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Staff management (Admin only)
router.get('/staff', protect, authorize('admin'), getAllStaff);
router.put('/staff/:id', protect, authorize('admin'), updateStaff);
router.delete('/staff/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
