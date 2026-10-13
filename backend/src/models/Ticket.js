const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { 
        type: String, 
        enum: ['Baja', 'Media', 'Alta'], 
        default: 'Baja' 
    },
    status: { 
        type: String, 
        enum: ['Pendiente', 'En Progreso', 'Resuelto', 'Archivado'], 
        default: 'Pendiente' 
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
