const nodemailer = require('nodemailer');

let transporter;
function getTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
    }
    return transporter;
}

async function sendWelcomeEmail(user) {
    const mailer = getTransporter();
    if (!mailer) return { skipped: true };
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    try {
        return await mailer.sendMail({
            from,
            to: user.email,
            subject: 'Welcome',
            text: `Hi ${user.name},\n\nYour account has been created successfully.`,
            html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your account has been created successfully.</p>`
        });
    } catch (error) {
        console.error('SMTP delivery error:', error.message);
        throw new Error('Unable to send welcome email');
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

module.exports = { sendWelcomeEmail };
