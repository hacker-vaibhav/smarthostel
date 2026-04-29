const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_PASSWORD || '').replace(/\s+/g, ''), // Normalize Gmail app password
  },
});

const withTimeout = (promise, label, ms = 15000) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeout,
  ]);
};

const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '🔐 Your OTP for Smart Hostel Registration',
      html: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Hostel Management</h1>
          <p style="color: white; font-size: 16px; margin: 10px 0;">Your verification code is:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #667eea; letter-spacing: 5px; font-family: monospace;">${otp}</h2>
          </div>
          <p style="color: white; font-size: 12px;">This code expires in 10 minutes</p>
        </div>
      `,
    };

    await withTimeout(transporter.sendMail(mailOptions), 'OTP email send', 15000);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    throw error;
  }
};

const sendPaymentReminder = async (email, userName, daysLeft, amount) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `💰 Payment Reminder - ${daysLeft} days left`,
      html: `
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 10px;">
          <h2 style="color: white;">Hi ${userName}! 👋</h2>
          <p style="color: white; font-size: 16px;">Your hostel payment is due in <strong>${daysLeft} days</strong></p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; margin: 5px 0;"><strong>Amount:</strong> ₹${amount}</p>
          </div>
          <p style="color: white; font-size: 14px;">Please login to the portal and complete your payment.</p>
        </div>
      `,
    };

    await withTimeout(transporter.sendMail(mailOptions), 'Payment reminder send', 15000);
    console.log(`✅ Payment reminder sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    throw error;
  }
};

const sendComplaintStatusUpdate = async (email, userName, complaintId, newStatus) => {
  try {
    const statusColors = {
      pending: '#FFA500',
      in_progress: '#4169E1',
      completed: '#228B22',
      escalated: '#DC143C',
    };

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `📋 Complaint #${complaintId} Status Update`,
      html: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
          <h2 style="color: white;">Hi ${userName}! 👋</h2>
          <p style="color: white; font-size: 16px;">Your complaint has been updated</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; margin: 5px 0;"><strong>Complaint ID:</strong> #${complaintId}</p>
            <p style="font-size: 14px; margin: 5px 0;">
              <strong>Status:</strong> 
              <span style="background: ${statusColors[newStatus]}; color: white; padding: 5px 10px; border-radius: 5px; text-transform: uppercase; font-size: 12px; font-weight: bold;">
                ${newStatus.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
          <p style="color: white; font-size: 14px;">Thank you for using Smart Hostel Management!</p>
        </div>
      `,
    };

    await withTimeout(transporter.sendMail(mailOptions), 'Status update send', 15000);
    console.log(`✅ Status update email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending status update:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  sendPaymentReminder,
  sendComplaintStatusUpdate,
};
