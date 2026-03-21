const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (to, otp, subject = 'Your OTP Code') => {
  // If Gmail credentials are not configured, fall back to console logging
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const isConfigured =
    emailUser &&
    emailPass &&
    emailUser !== 'your.gmail@gmail.com' &&
    !emailPass.includes('xxxx');

  if (!isConfigured) {
    // ─── DEV MODE: Print OTP to terminal ───────────────────────────────
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║           📧  OTP (DEV MODE)             ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  To      : ${to.padEnd(30)} ║`);
    console.log(`║  Subject : ${subject.substring(0, 30).padEnd(30)} ║`);
    console.log(`║  OTP     : ${otp.padEnd(30)} ║`);
    console.log('╚══════════════════════════════════════════╝\n');
    return; // Don't throw — just log it
  }

  // ─── PRODUCTION: Send via Gmail SMTP ───────────────────────────────
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });

  const mailOptions = {
    from: `"LibraryPro" <${emailUser}>`,
    to,
    subject,
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:900;">📚 LibraryPro</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Library Management System</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#0f172a;margin:0 0 8px;font-size:20px;font-weight:800;">${subject}</h2>
          <p style="color:#64748b;margin:0 0 32px;font-size:15px;line-height:1.6;">Your verification code (valid for <strong>10 minutes</strong>):</p>
          <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#2563eb;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:0;text-align:center;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent to ${to}`);
};

module.exports = { generateOTP, sendOTPEmail };
