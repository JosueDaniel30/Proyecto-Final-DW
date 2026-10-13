require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

const seedDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://admin:adminpassword@localhost:27017/galacticos_db?authSource=admin';
        console.log('Conectando a MongoDB...');
        await mongoose.connect(uri);
        console.log('Conexión establecida con éxito.');

        // Limpiar colecciones anteriores para asegurar consistencia
        console.log('Limpiando colecciones existentes...');
        await User.deleteMany({});
        await Ticket.deleteMany({});

        console.log('Insertando usuarios iniciales...');
        // Crear usuarios con contraseñas que serán hasheadas por el middleware pre('save')
        const admin = await User.create({
            name: 'Administrador Galáctico',
            email: 'admin@galacticos.com',
            password: 'AdminPassword123!',
            role: 'Administrador'
        });

        const tech1 = await User.create({
            name: 'Carlos Soporte',
            email: 'carlos.tecnico@galacticos.com',
            password: 'TechPassword123!',
            role: 'Técnico'
        });

        const tech2 = await User.create({
            name: 'Laura Redes',
            email: 'laura.tecnico@galacticos.com',
            password: 'TechPassword123!',
            role: 'Técnico'
        });

        const client1 = await User.create({
            name: 'Juan Pérez',
            email: 'juan.cliente@empresa.com',
            password: 'ClientPassword123!',
            role: 'Cliente'
        });

        const client2 = await User.create({
            name: 'María García',
            email: 'maria.cliente@empresa.com',
            password: 'ClientPassword123!',
            role: 'Cliente'
        });

        console.log('Usuarios creados:');
        console.log(`- Administrador: ${admin.email} (pass: AdminPassword123!)`);
        console.log(`- Técnico 1: ${tech1.email} (pass: TechPassword123!)`);
        console.log(`- Técnico 2: ${tech2.email} (pass: TechPassword123!)`);
        console.log(`- Cliente 1: ${client1.email} (pass: ClientPassword123!)`);
        console.log(`- Cliente 2: ${client2.email} (pass: ClientPassword123!)`);

        console.log('Creando tickets de prueba...');
        const tickets = await Ticket.create([
            {
                title: 'Fallo al ingresar a la plataforma VPN',
                description: 'No puedo conectar con la VPN corporativa desde el cliente de escritorio. Da error 403.',
                priority: 'Alta',
                status: 'En Progreso',
                client: client1._id,
                technician: tech1._id
            },
            {
                title: 'Solicitud de monitor secundario',
                description: 'Requiero un segundo monitor HDMI para el área contable.',
                priority: 'Baja',
                status: 'Pendiente',
                client: client1._id
            },
            {
                title: 'Impresora del piso 2 sin conexión de red',
                description: 'La impresora de red no responde a las solicitudes de impresión desde las terminales.',
                priority: 'Media',
                status: 'En Progreso',
                client: client2._id,
                technician: tech2._id
            },
            {
                title: 'Actualización de licencia de software CAD',
                description: 'Se requiere renovar el token de la licencia anual antes de que expire.',
                priority: 'Media',
                status: 'Resuelto',
                client: client2._id,
                technician: tech1._id
            }
        ]);

        console.log(`Se insertaron ${tickets.length} tickets de prueba.`);
        console.log('Base de datos MongoDB inicializada y poblada exitosamente.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error durante la inicialización de la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();
