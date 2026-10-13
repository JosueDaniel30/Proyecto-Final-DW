/**
 * Servicio para envío de notificaciones a través del Bot de Telegram.
 * Utiliza fetch nativo de Node.js (disponible desde Node 18+).
 */
const sendTelegramNotification = async (message) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('⚠️ [Telegram]: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados en .env.');
        return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('❌ Error de la API de Telegram:', data.description);
            return false;
        }

        console.log('✅ Mensaje enviado exitosamente por Telegram.');
        return true;
    } catch (error) {
        console.error('❌ Error al enviar notificación por Telegram:', error.message);
        return false;
    }
};

module.exports = { sendTelegramNotification };
