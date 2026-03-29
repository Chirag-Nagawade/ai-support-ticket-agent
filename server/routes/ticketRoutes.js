const express = require('express');
const { createTicket, getTickets, updateTicketStatus, getAdminStats, getResolutionTrends, replyToTicket, getSystemAlerts } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createTicket)
  .get(protect, getTickets);

router.route('/:id/status')
  .put(protect, authorize('agent', 'admin'), updateTicketStatus);

// New endpoint for users to reply to 'Pending Info' tickets
router.route('/:id/reply')
  .put(protect, replyToTicket);

router.get('/outage-status', protect, authorize('agent', 'admin'), getSystemAlerts);
router.get('/stats/admin', protect, authorize('admin'), getAdminStats);
router.get('/trends/admin', protect, authorize('admin'), getResolutionTrends);

module.exports = router;

