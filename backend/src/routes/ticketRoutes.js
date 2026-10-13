const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicketStatus } = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Cliente', 'Administrador'), createTicket)
    .get(getTickets);

router.route('/:id/status')
    .put(authorize('Técnico', 'Administrador'), updateTicketStatus);

module.exports = router;
