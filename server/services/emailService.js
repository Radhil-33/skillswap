const nodemailer = require('nodemailer');

// Create transporter using Gmail or your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send welcome email on registration
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@skillswap.com',
      to: email,
      subject: '🎉 Welcome to SkillSwap!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Welcome to SkillSwap!</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Thank you for signing up for SkillSwap! We're excited to have you join our community of skill-sharing enthusiasts.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              <strong>What you can do now:</strong>
            </p>
            <ul style="font-size: 14px; color: #666; line-height: 1.8;">
              <li>Complete your profile with your skills and interests</li>
              <li>Browse available skill exchanges</li>
              <li>Connect with other community members</li>
              <li>Start learning and teaching!</li>
            </ul>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Happy skill-sharing!<br/>
              <strong>The SkillSwap Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
              © 2024 SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return false;
  }
};

// Send login notification email
const sendLoginNotificationEmail = async (email, name, loginTime, location = 'Unknown') => {
  try {
    const formattedTime = new Date(loginTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@skillswap.com',
      to: email,
      subject: '🔐 Login Notification - SkillSwap',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Login Notification</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              We noticed a login to your SkillSwap account.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="font-size: 14px; color: #333; margin: 5px 0;">
                <strong>📅 Time:</strong> ${formattedTime}
              </p>
              <p style="font-size: 14px; color: #333; margin: 5px 0;">
                <strong>📍 Location:</strong> ${location}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              <strong>Is this you?</strong><br/>
              If you didn't authorize this login, please change your password immediately or contact our support team.
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              For security reasons, we never ask for your password via email. Please don't share your login credentials with anyone.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
              © 2024 SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Login notification email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Error sending login notification email:', err);
    return false;
  }
};

// Send admin registration email
const sendAdminWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@skillswap.com',
      to: email,
      subject: '⭐ Welcome Admin - SkillSwap',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Welcome Admin!</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Congratulations! Your admin account has been created successfully.
            </p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              <strong>Your admin privileges include:</strong>
            </p>
            <ul style="font-size: 14px; color: #666; line-height: 1.8;">
              <li>Access to admin dashboard</li>
              <li>Manage all user accounts</li>
              <li>View system statistics</li>
              <li>Moderate content and reports</li>
            </ul>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6; background-color: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <strong>⚠️ Remember:</strong> With great power comes great responsibility. Please use your admin privileges wisely and in accordance with our policies.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions, feel free to contact the system administrator.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
              © 2024 SkillSwap. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Error sending admin welcome email:', err);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendAdminWelcomeEmail,
};
