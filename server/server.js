import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskflow')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Models ---

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  taskname: { type: String, required: true },
  process: { type: String, default: 'Inprogress' },
  priority: { type: String, default: 'Medium' },
  description: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  edited: { type: Boolean, default: false },
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
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user.password === password) {
        res.status(200).json({ message: 'Login successful', user });
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    } else {
      user = new User({ email, password });
      await user.save();
      res.status(201).json({ message: 'User created and logged in', user });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/data/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
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
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
