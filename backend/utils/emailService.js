const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use 'gmail', 'outlook', or other services
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Send email function
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"OptiDoc System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // Patient signup welcome email
  patientWelcome: (fullName, username, password) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to OptiDoc!</h1>
        </div>
        <div class="content">
          <h2>Hello ${fullName},</h2>
          <p>Thank you for registering with OptiDoc. Your account has been successfully created!</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <p>Please keep these credentials safe and change your password after your first login for security.</p>
          <p>You can now book appointments with our experienced doctors.</p>
          
          <a href="http://localhost:5173/login" class="button">Login Now</a>
        </div>
        <div class="footer">
          <p>© 2025 OptiDoc. All rights reserved.</p>
          <p>If you didn't create this account, please contact us immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Doctor account created email
  doctorWelcome: (fullName, username, password, specialty) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .credentials { background-color: #fff; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to OptiDoc, Dr. ${fullName}!</h1>
        </div>
        <div class="content">
          <h2>Hello Dr. ${fullName},</h2>
          <p>Your doctor account has been created by the OptiDoc administration team.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Specialty:</strong> ${specialty}</p>
          </div>
          
          <p>Please login and change your password immediately for security purposes.</p>
          <p>You can now manage your appointments and interact with patients through the OptiDoc platform.</p>
          
          <a href="http://localhost:5173/login" class="button">Login to Dashboard</a>
        </div>
        <div class="footer">
          <p>© 2025 OptiDoc. All rights reserved.</p>
          <p>For any queries, please contact the admin.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Appointment booked confirmation
  appointmentBooked: (patientName, doctorName, date, time, specialty) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .appointment-details { background-color: #fff; padding: 20px; border-left: 4px solid #3B82F6; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Appointment Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>Your appointment has been successfully booked!</p>
          
          <div class="appointment-details">
            <h3>Appointment Details:</h3>
            <div class="detail-row"><strong>Doctor:</strong> Dr. ${doctorName}</div>
            <div class="detail-row"><strong>Specialty:</strong> ${specialty}</div>
            <div class="detail-row"><strong>Date:</strong> ${date}</div>
            <div class="detail-row"><strong>Time:</strong> ${time}</div>
            <div class="detail-row"><strong>Status:</strong> <span style="color: #10B981;">Booked</span></div>
          </div>
          
          <p>Please arrive 10 minutes before your scheduled time.</p>
          <p>If you need to reschedule or cancel, please contact us in advance.</p>
        </div>
        <div class="footer">
          <p>© 2025 OptiDoc. All rights reserved.</p>
          <p>Need help? Contact us at support@optidoc.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Appointment status changed
  appointmentStatusChanged: (patientName, doctorName, date, time, oldStatus, newStatus, message) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .appointment-details { background-color: #fff; padding: 20px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .status-change { background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Status Update</h1>
        </div>
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>There has been an update to your appointment status.</p>
          
          <div class="status-change">
            <strong>Status Change:</strong> ${oldStatus} → <strong>${newStatus}</strong>
          </div>
          
          <div class="appointment-details">
            <h3>Appointment Details:</h3>
            <div class="detail-row"><strong>Doctor:</strong> Dr. ${doctorName}</div>
            <div class="detail-row"><strong>Date:</strong> ${date}</div>
            <div class="detail-row"><strong>Time:</strong> ${time}</div>
            <div class="detail-row"><strong>New Status:</strong> ${newStatus}</div>
            ${message ? `<div class="detail-row"><strong>Message:</strong> ${message}</div>` : ''}
          </div>
          
          <p>If you have any questions or concerns, please contact us.</p>
        </div>
        <div class="footer">
          <p>© 2025 OptiDoc. All rights reserved.</p>
          <p>Need help? Contact us at support@optidoc.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Doctor profile updated email
  doctorProfileUpdated: (fullName, username, specialty, passwordChanged) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .profile-details { background-color: #fff; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .warning { background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Profile Updated - OptiDoc</h1>
        </div>
        <div class="content">
          <h2>Hello Dr. ${fullName},</h2>
          <p>Your doctor profile has been updated by the OptiDoc administration team.</p>
          
          <div class="profile-details">
            <h3>Updated Profile Details:</h3>
            <div class="detail-row"><strong>Username:</strong> ${username}</div>
            <div class="detail-row"><strong>Specialty:</strong> ${specialty}</div>
            ${passwordChanged ? '<div class="detail-row"><strong>Password:</strong> ✓ Updated</div>' : ''}
          </div>
          
          ${passwordChanged ? `
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            Your password has been changed by the administrator. Please login with your new password and change it for security purposes.
          </div>
          ` : ''}
          
          <p>If you have any questions about these changes, please contact the administrator.</p>
          
          <a href="http://localhost:5173/login" class="button">Login to Dashboard</a>
        </div>
        <div class="footer">
          <p>© 2025 OptiDoc. All rights reserved.</p>
          <p>If you did not request these changes, please contact the admin immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
