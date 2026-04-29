const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const BACKEND_URL = process.env.BACKEND_URL;
const JWT_TOKEN = process.env.BACKEND_JWT_TOKEN;

// Store user sessions temporarily
const userSessions = {};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '🧠 Welcome to Smart Hostel Management Bot!\n\nI can help you submit complaints directly. Use /complaint to start.', {
    reply_markup: {
      keyboard: [
        [{ text: '📋 Submit Complaint' }, { text: '📊 Dashboard' }],
        [{ text: '💰 View Payments' }, { text: '❓ Help' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
});

// Help command
bot.onText(/\/help|❓ Help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🤖 Smart Hostel Bot Commands:

📋 /complaint - Submit a complaint
  • Send text describing the issue
  • Then send an image
  • AI will analyze and categorize

📊 /dashboard - View hostel statistics

💰 /payments - Check your payments

ℹ️ /help - Show this message

📞 Contact support for assistance
  `;
  bot.sendMessage(chatId, helpMessage);
});

// Complaint command
bot.onText(/\/complaint|📋 Submit Complaint/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { step: 'awaiting_text' };
  bot.sendMessage(chatId, '✍️ Please describe your complaint. What\'s the issue?\n\n(e.g., Water leakage in room, WiFi not working, Noise issue, etc.)');
});

// Handle text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/') || ['📋 Submit Complaint', '📊 Dashboard', '💰 View Payments', '❓ Help'].includes(text)) {
    return; // Let command handlers handle these
  }

  const session = userSessions[chatId];

  if (session?.step === 'awaiting_text') {
    session.complaintText = text;
    session.step = 'awaiting_image';
    bot.sendMessage(chatId, '📸 Now please send an image of the issue.\n\n(This helps us understand the problem better)');
  }
});

// Handle photo messages
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (!session || session.step !== 'awaiting_image') {
    bot.sendMessage(chatId, '❌ Please use /complaint first to start the process.');
    return;
  }

  try {
    // Get photo file
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const filePath = file.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

    // Download image
    const imageResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    // Create FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('text', session.complaintText);
    form.append('image', imageResponse.data, { filename: 'complaint.jpg' });

    // Send to backend
    bot.sendMessage(chatId, '⏳ Processing your complaint...');

    const response = await axios.post(`${BACKEND_URL}/complaints`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${JWT_TOKEN}`,
      },
    });

    // Send confirmation
    const analysis = response.data.analysis;
    bot.sendMessage(chatId, `✅ Complaint Submitted Successfully!\n\n📋 Analysis:\n• Category: ${analysis.category}\n• Priority: ${analysis.priority.toUpperCase()}\n• Summary: ${analysis.summary}\n• Suggested Staff: ${analysis.suggested_staff}\n\nYour complaint ID: #${response.data.complaint.id}`, {
      reply_markup: {
        keyboard: [
          [{ text: '📋 Submit Another' }, { text: '📊 Dashboard' }],
          [{ text: 'Main Menu' }],
        ],
        resize_keyboard: true,
      },
    });

    // Clear session
    delete userSessions[chatId];

  } catch (error) {
    console.error('Error submitting complaint:', error);
    bot.sendMessage(chatId, '❌ Error submitting complaint. Please try again.\n' + (error.response?.data?.message || error.message));
  }
});

// Handle inline callbacks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'complaint') {
    userSessions[chatId] = { step: 'awaiting_text' };
    bot.sendMessage(chatId, '✍️ Please describe your complaint.');
  } else if (data === 'dashboard') {
    bot.sendMessage(chatId, '📊 Dashboard: Go to https://localhost:3000/dashboard to view your hostel dashboard');
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('❌ Bot Error:', error);
});

console.log('🤖 Smart Hostel Telegram Bot is running...');
console.log('📤 Ready to receive complaints via Telegram');
