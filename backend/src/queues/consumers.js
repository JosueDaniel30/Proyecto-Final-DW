const { getChannel } = require('../config/rabbitmq');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendTelegramNotification } = require('../services/telegramService');

const startConsumers = async () => {
    const channel = getChannel();
    if (!channel) return setTimeout(startConsumers, 5000);

    // Consumidor para asignación de tickets
    channel.consume('ticket_assignment', async (msg) => {
        if (msg !== null) {
            try {
                const { ticketId } = JSON.parse(msg.content.toString());
                
                // Lógica de asignación: buscar un técnico disponible
                const technicians = await User.find({ role: 'Técnico' });
                const ticket = await Ticket.findById(ticketId).populate('client', 'name email');
                
                if (technicians.length > 0 && ticket) {
                    const randomTech = technicians[Math.floor(Math.random() * technicians.length)];
                    ticket.technician = randomTech._id;
                    ticket.status = 'En Progreso';
                    await ticket.save();

                    console.log(`Ticket ${ticketId} asignado a técnico ${randomTech.name}`);
                    
                    // Encolar notificación para Telegram / logs
                    channel.sendToQueue('ticket_notifications', Buffer.from(JSON.stringify({
                        ticketId: ticket._id,
                        ticketTitle: ticket.title,
                        priority: ticket.priority,
                        clientName: ticket.client?.name,
                        technicianName: randomTech.name,
                        message: `El ticket <b>"${ticket.title}"</b> ha sido asignado al técnico <b>${randomTech.name}</b>.`,
                        type: 'TICKET_ASSIGNED'
                    })));
                } else {
                    console.log('No hay técnicos disponibles para asignar el ticket.');
                }
                
                channel.ack(msg);
            } catch (error) {
                console.error('Error al procesar asignación:', error);
                channel.nack(msg);
            }
        }
    });

    // Consumidor para notificaciones vía Telegram
    channel.consume('ticket_notifications', async (msg) => {
        if (msg !== null) {
            try {
                const data = JSON.parse(msg.content.toString());
                console.log('--- NOTIFICACIÓN ENTRANTE EN RABBITMQ ---');
                console.log(`Ticket ID: ${data.ticketId}`);
                console.log(`Mensaje: ${data.message}`);
                console.log('-----------------------------------------');

                // Si viene más detalle del ticket, preparamos un mensaje estructurado y elegante para Telegram
                const ticket = await Ticket.findById(data.ticketId)
                    .populate('client', 'name email')
                    .populate('technician', 'name email');

                let telegramText = '';

                if (ticket) {
                    const statusEmoji = ticket.status === 'Resuelto' ? '✅' : ticket.status === 'En Progreso' ? '⚡' : '⏳';
                    const priorityEmoji = ticket.priority === 'Alta' ? '🔴' : ticket.priority === 'Media' ? '🟡' : '🟢';

                    telegramText = `<b>🎫 Actualización de Ticket - Galácticos S.A.</b>\n\n` +
                        `📌 <b>Título:</b> ${ticket.title}\n` +
                        `${priorityEmoji} <b>Prioridad:</b> ${ticket.priority}\n` +
                        `${statusEmoji} <b>Estado:</b> ${ticket.status}\n` +
                        `👤 <b>Cliente:</b> ${ticket.client?.name || 'N/A'} (${ticket.client?.email || 'N/A'})\n` +
                        `🛠️ <b>Técnico:</b> ${ticket.technician ? ticket.technician.name : 'Sin asignar'}\n\n` +
                        `💬 <b>Detalle:</b> ${data.message || 'Sin mensaje adicional'}`;
                } else {
                    telegramText = `<b>🎫 Notificación de Soporte</b>\n\n${data.message}`;
                }

                // Disparar mensaje por Bot de Telegram
                await sendTelegramNotification(telegramText);

                channel.ack(msg);
            } catch (error) {
                console.error('Error al enviar notificación:', error);
                channel.nack(msg);
            }
        }
    });
};

module.exports = { startConsumers };
