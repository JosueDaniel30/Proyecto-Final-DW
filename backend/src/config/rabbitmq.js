const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
        channel = await connection.createChannel();
        
        // Assert colas
        await channel.assertQueue('ticket_assignment', { durable: true });
        await channel.assertQueue('ticket_notifications', { durable: true });
        
        console.log('RabbitMQ conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar con RabbitMQ:', error);
        process.exit(1);
    }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
