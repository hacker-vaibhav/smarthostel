const pool = require('../config/database');
const axios = require('axios');
const { sendPaymentReminder } = require('./emailService');

const createNotification = async ({
  tenantId,
  userId,
  type,
  title,
  message,
  channel = 'in_app',
  metadata = {},
}) => {
  const result = await pool.query(
    `INSERT INTO notifications (tenant_id, user_id, type, title, message, channel, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId || null, userId || null, type, title, message, channel, metadata]
  );

  return result.rows[0];
};

const notifyComplaintUpdate = async (complaint, message) => {
  return createNotification({
    tenantId: complaint.tenant_id,
    userId: complaint.user_id,
    type: 'complaint_update',
    title: `Complaint #${complaint.id} updated`,
    message,
    metadata: { complaintId: complaint.id, status: complaint.status },
  });
};

const notifyEscalation = async (complaint) => {
  const notification = await createNotification({
    tenantId: complaint.tenant_id,
    userId: complaint.user_id,
    type: 'escalation_alert',
    title: `Complaint #${complaint.id} escalated`,
    message: 'This complaint has been escalated for management visibility.',
    metadata: { complaintId: complaint.id, priority: complaint.priority },
  });

  await sendTelegramNotification(`Escalation alert: Complaint #${complaint.id} is now visible to management.`);
  return notification;
};

const notifyPaymentReminder = async (payment) => {
  await createNotification({
    tenantId: payment.tenant_id,
    userId: payment.user_id,
    type: 'payment_reminder',
    title: 'Payment reminder',
    message: `Payment of Rs.${payment.amount} is due on ${new Date(payment.due_date).toLocaleDateString()}.`,
    channel: 'email',
    metadata: { paymentId: payment.id },
  });

  const daysLeft = Math.ceil((new Date(payment.due_date) - new Date()) / (1000 * 60 * 60 * 24));
  return sendPaymentReminder(payment.email, payment.name, daysLeft, payment.amount);
};

const sendTelegramNotification = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) return null;

  try {
    return axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error('Error sending Telegram notification:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
  notifyComplaintUpdate,
  notifyEscalation,
  notifyPaymentReminder,
  sendTelegramNotification,
};
