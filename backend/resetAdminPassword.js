const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin by username
    const username = 'omkapadiya'; // Change this if needed
    const newPassword = 'admin123'; // Change this to your desired password

    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      console.log(`Admin user '${username}' not found`);
      process.exit(0);
    }

    // Update password (will be automatically hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    console.log('✅ Password reset successful!');
    console.log('Username:', username);
    console.log('New Password:', newPassword);
    console.log('\n⚠️  Please change this password after logging in for security.');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

resetAdminPassword();
