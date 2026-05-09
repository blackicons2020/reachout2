import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'owner' },
  displayName: String,
  setupCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'superadmin@gmail.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = 'superadmin';
      existingUser.displayName = 'Super Admin';
      existingUser.setupCompleted = true;
      await existingUser.save();
      console.log('Super Admin updated successfully');
    } else {
      const user = new User({
        email,
        password: hashedPassword,
        role: 'superadmin',
        displayName: 'Super Admin',
        setupCompleted: true
      });
      await user.save();
      console.log('Super Admin created successfully');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
