// services/email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email to user.
 * @param {string} toEmail
 * @param {string} userName
 * @param {string} otp
 */
const sendOTPEmail = async (toEmail, userName, otp) => {
  await transporter.sendMail({
    from: `"PSG Inventory" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'PSG Inventory — Your OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f5f5f0;font-family:'Courier New',monospace;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 0;">
              <table width="480" cellpadding="0" cellspacing="0"
                     style="background:#fff;border:2px solid #111;border-radius:0;">
                <!-- Header -->
                <tr>
                  <td style="background:#111;padding:24px 32px;">
                    <p style="margin:0;color:#c8a84b;font-size:11px;letter-spacing:4px;
                               text-transform:uppercase;">Patel Sports & Goods</p>
                    <p style="margin:4px 0 0;color:#fff;font-size:18px;font-weight:700;
                               letter-spacing:2px;">PSG INVENTORY</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px;color:#555;font-size:13px;">
                      Hello ${userName || 'User'},
                    </p>
                    <p style="margin:0 0 28px;color:#111;font-size:14px;">
                      Your one-time password for account access:
                    </p>
                    <!-- OTP Box -->
                    <div style="background:#f5f5f0;border:1px solid #ddd;padding:24px;
                                text-align:center;margin-bottom:24px;">
                      <span style="font-size:42px;font-weight:700;letter-spacing:12px;
                                   color:#111;">${otp}</span>
                    </div>
                    <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                      This code expires in <strong>10 minutes</strong>.<br/>
                      Do not share it with anyone. PSG staff will never ask for your OTP.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="border-top:1px solid #eee;padding:16px 32px;">
                    <p style="margin:0;color:#aaa;font-size:11px;">
                      Patel Sports & Goods — Inventory Management System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};

module.exports = { sendOTPEmail };
