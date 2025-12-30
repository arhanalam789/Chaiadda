require('dotenv').config();
const sendOtpEmail = require('./utils/emailService');

const testEmail = async () => {
    const recipient = '9f023e001@smtp-brevo.com'; // Sending to self/sender as test
    const otp = '123456';

    console.log(`Attempting to send email to ${recipient}...`);
    try {
        await sendOtpEmail(recipient, otp);
        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
    }
};

testEmail();
