import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
// Increase JSON payload limit to accept base64 images
app.use(express.json({ limit: '10mb' }));

// Ensure uploads folder exists and serve it
const avatarsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Password Hashing Helpers ---
const hashPassword = (password) => {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!password || !storedPassword) return false;
  // Support backwards compatibility for plain text passwords
  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }
  const [salt, hash] = storedPassword.split(':');
  const derivedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return derivedHash === hash;
};

// --- Models ---

// User Schema
const userSchema = new mongoose.Schema({
  taskname: { type: String }, // Made optional to prevent validation crashes for existing users
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String }, // Now stores filesystem path
  // Additional details
  phone: { type: String },
  jobTitle: { type: String },
  bio: { type: String }
});
const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expires in 5 minutes
});
const OTP = mongoose.model('OTP', otpSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  taskname: { type: String, required: true },
  process: { type: String, default: 'Inprogress' },
  priority: { type: String, default: 'Medium' },
  description: { type: String }, // No default empty string to save space
  createdDate: { type: String }, // Renamed from dueDate and made optional to save space
  tag: { type: String },         // No default to save space
  edited: { type: Boolean },
  created: { 
    type: String, 
    default: () => {
      const d = new Date();
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
  }
});

// Map _id to id when returning JSON to keep frontend compatible
taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
    } else if (document._id) {
      returnedObject.id = document._id.toString();
    }
    delete returnedObject.__v;
  }
});

const Task = mongoose.model('Task', taskSchema);

// --- Routes ---

// Auth Login/Signup Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password, taskname, phone, jobTitle, bio } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user.isDeleted) {
        return res.status(403).json({ message: 'This account has been deleted. Please contact customer support.' });
      }
      if (verifyPassword(password, user.password)) {
        // Upgrade password to hashed format if it was stored as plain text
        if (!user.password.includes(':')) {
          user.password = hashPassword(password);
          await user.save();
        }
        // Create safe user object without password
        const safeUser = { ...user._doc };
        delete safeUser.password;
        res.status(200).json({ message: 'Login successful', user: safeUser });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      // Create a new user with optional fields sanitized to undefined (won't take space in DB)
      user = new User({ 
        email, 
        password: hashPassword(password), 
        taskname: taskname || email.split('@')[0],
        phone: phone ? phone : undefined,
        jobTitle: jobTitle ? jobTitle : undefined,
        bio: bio ? bio : undefined
      });
      await user.save();
      
      const safeUser = { ...user._doc };
      delete safeUser.password;
      res.status(201).json({ message: 'User created and logged in', user: safeUser });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request Password Update OTP
app.post('/api/auth/password/otp', async (req, res) => {
  const { email, oldPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!verifyPassword(oldPassword, user.password)) return res.status(401).json({ message: 'Invalid current password' });
    
    // Generate 6 digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB (upsert if exists)
    await OTP.findOneAndUpdate(
      { email },
      { otp: generatedOtp, createdAt: Date.now() },
      { upsert: true, new: true }
    );
    
    // SIMULATED EMAIL SEND (Log to terminal)
    console.log(`\n==============================================`);
    console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
    console.log(`🔒 YOUR PASSWORD CHANGE OTP IS: ${generatedOtp}`);
    console.log(`==============================================\n`);

    res.status(200).json({ message: 'OTP sent to email (check terminal)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify OTP and Update Password (Old Change Password Flow)
app.post('/api/auth/password/verify', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    const user = await User.findOne({ email });
    user.password = hashPassword(newPassword);
    await user.save();
    
    // Delete OTP after successful use
    await OTP.deleteOne({ email });
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Request OTP for Forgot Password (No oldPassword required)
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.findOneAndUpdate(
      { email },
      { otp: generatedOtp, createdAt: Date.now() },
      { upsert: true, new: true }
    );
    
    console.log(`\n==============================================`);
    console.log(`📧 MOCK EMAIL SENT TO: ${email}`);
    console.log(`🔓 FORGOT PASSWORD OTP IS: ${generatedOtp}`);
    console.log(`==============================================\n`);

    res.status(200).json({ message: 'OTP sent to email (check terminal)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reset Password (Forgot Password flow)
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
    
    const user = await User.findOne({ email });
    user.password = hashPassword(newPassword);
    await user.save();
    
    await OTP.deleteOne({ email });
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update Avatar Route (Optimized to filesystem)
app.post('/api/auth/avatar', async (req, res) => {
  const { email, avatarUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let finalAvatarPath = avatarUrl; // fallback or if it's already a URL

    // If it's a base64 string, write it to disk
    if (avatarUrl && avatarUrl.startsWith('data:image')) {
      const matches = avatarUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageBuffer = Buffer.from(matches[2], 'base64');
        
        // Ensure a safe filename
        const safeEmail = email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `avatar_${safeEmail}_${Date.now()}.png`;
        const filepath = path.join(avatarsDir, filename);
        
        fs.writeFileSync(filepath, imageBuffer);
        finalAvatarPath = `http://localhost:3001/uploads/avatars/${filename}`;
      }
    } else if (!avatarUrl) {
      // If user is removing their avatar, set to undefined so it is not stored in MongoDB
      finalAvatarPath = undefined;
    }

    user.avatarUrl = finalAvatarPath;
    await user.save();
    
    // Create safe user object without password
    const safeUser = { ...user._doc };
    delete safeUser.password;
    
    res.status(200).json({ message: 'Avatar updated', user: safeUser });
  } catch (err) {
    console.error("Avatar update error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update Profile Details Route
app.post('/api/auth/profile', async (req, res) => {
  const { email, taskname, phone, jobTitle, bio } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (taskname !== undefined) user.taskname = taskname || undefined;
    // Set to undefined if empty, so it does not take up space in the MongoDB document
    if (phone !== undefined) user.phone = phone ? phone : undefined;
    if (jobTitle !== undefined) user.jobTitle = jobTitle ? jobTitle : undefined;
    if (bio !== undefined) user.bio = bio ? bio : undefined;
    
    await user.save();
    
    const safeUser = { ...user._doc };
    delete safeUser.password;
    
    res.status(200).json({ message: 'Profile updated', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete Account Route (Soft Delete)
app.delete('/api/auth/account', async (req, res) => {
  const { email } = req.body;
  try {
    await User.findOneAndUpdate({ email }, { isDeleted: true });
    await Task.deleteMany({ userId: email });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Task Routes
app.get('/data', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {}; 
    const tasks = await Task.find(filter); 
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/data/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/data', async (req, res) => {
  try {
    const body = { ...req.body };
    // Remove empty fields so they don't take up space in MongoDB
    if (body.description === "") delete body.description;
    if (body.createdDate === "") delete body.createdDate;
    if (body.tag === "") delete body.tag;
    if (body.edited === false) delete body.edited;

    const newTask = new Task(body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/data/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    const updateQuery = { $set: {}, $unset: {} };

    for (const key in body) {
      if (body[key] === "" || body[key] === null || body[key] === undefined) {
        updateQuery.$unset[key] = "";
      } else {
        updateQuery.$set[key] = body[key];
      }
    }

    // Clean up query if empty
    if (Object.keys(updateQuery.$unset).length === 0) delete updateQuery.$unset;
    if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/data/:id', async (req, res) => {
  try {
    req.body.edited = true;
    const body = { ...req.body };
    
    // Remove empty values to save storage on full document overwrite
    if (body.description === "") body.description = undefined;
    if (body.createdDate === "") body.createdDate = undefined;
    if (body.tag === "") body.tag = undefined;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, overwrite: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/data/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Completed Tasks
app.delete('/data/completed', async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(400).json({ message: 'userId required' });
    await Task.deleteMany({ userId, process: 'Complete' });
    res.status(200).json({ message: 'Completed tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
