const express = require('express');
const { createTicket, getTickets, updateTicketStatus, getAdminStats, getResolutionTrends } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createTicket)
  .get(protect, getTickets);

router.route('/:id/status')
  .put(protect, authorize('agent', 'admin'), updateTicketStatus);

router.get('/stats/admin', protect, authorize('admin'), getAdminStats);
router.get('/trends/admin', protect, authorize('admin'), getResolutionTrends);

module.exports = router;

