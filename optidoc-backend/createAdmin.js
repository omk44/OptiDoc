const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const adminUser = new Admin({
      fullName: 'System Administrator',
      email: 'admin@optidoc.com',
      phone: '+91-9876543210',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the default password after first login for security.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createDefaultAdmin();
