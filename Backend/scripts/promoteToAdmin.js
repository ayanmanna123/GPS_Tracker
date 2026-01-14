import User from '../models/User.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function promoteUserToAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }
    
    user.status = 'admin';
    await user.save();
    
    console.log(`User ${user.name} (${user.email}) has been promoted to admin.`);
  } catch (error) {
    console.error('Error promoting user to admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Usage: node promoteToAdmin.js email@domain.com
if (process.argv[2]) {
  const email = process.argv[2];
  promoteUserToAdmin(email);
} else {
  console.log('Usage: node promoteToAdmin.js <email>');
}