const Ticket = require('../models/Ticket');
const { getChannel } = require('../config/rabbitmq');

exports.createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        
        const ticket = await Ticket.create({
            title,
            description,
            priority,
            client: req.user._id
        });
        
        // Encolar trabajo para asignar ticket
        const channel = getChannel();
        if (channel) {
            channel.sendToQueue('ticket_assignment', Buffer.from(JSON.stringify({ ticketId: ticket._id })));
        }
        
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTickets = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Cliente') {
            query.client = req.user._id;
        } else if (req.user.role === 'Técnico') {
            query.technician = req.user._id;
        }
        
        const tickets = await Ticket.find(query)
            .populate('client', 'name email')
            .populate('technician', 'name email');
            
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const ticket = await Ticket.findById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
        
        ticket.status = status;
        await ticket.save();
        
        // Notificar cambio de estado
        const channel = getChannel();
        if (channel) {
            channel.sendToQueue('ticket_notifications', Buffer.from(JSON.stringify({ 
                ticketId: ticket._id,
                message: `El estado del ticket ha cambiado a: ${status}`
            })));
        }
        
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
