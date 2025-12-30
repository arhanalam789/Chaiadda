const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 2525,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Network settings
      connectionTimeout: 30000,
      greetingTimeout: 10000,
      logger: true,
      debug: true
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Chai Adda Login OTP',
      html: ` 
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Login Verification</h2>
          <p>Your OTP for Chai Adda login is:</p>
          <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = sendOtpEmail;
