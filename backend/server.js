const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobPortalDB';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 2500,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB warning (using in-memory fallback):', err.message));

// Job Schema
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  type: String,
  stipend: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Application Schema
const applicationSchema = new mongoose.Schema({
  jobTitle: String,
  company: String,
  name: String,
  email: String,
  appliedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

// In-memory fallback data for demo environments (e.g. Vercel before cloud DB is configured)
let memoryJobs = [
  { _id: '1', title: 'Web Development Intern', company: 'Infosys', type: 'Internship', stipend: '25,000 / month', createdAt: new Date() },
  { _id: '2', title: 'Full Stack Developer', company: 'TCS', type: 'Job', stipend: '6.5 LPA', createdAt: new Date() },
  { _id: '3', title: 'Server Handler', company: 'HCL', type: 'Job', stipend: '50,000 / month', createdAt: new Date() }
];

let memoryApps = [
  { _id: '1', name: 'Rahul Sharma', jobTitle: 'Web Development Intern', company: 'Infosys', email: 'rahul@example.com', appliedAt: new Date() }
];

// 1. GET - Read all jobs (newest first)
app.get('/api/jobs', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const jobs = await Job.find().sort({ createdAt: -1 });
      return res.json(jobs);
    }
    return res.json(memoryJobs);
  } catch (err) {
    return res.json(memoryJobs);
  }
});

// 2. POST - Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const newJob = new Job(req.body);
      const savedJob = await newJob.save();
      return res.json(savedJob);
    }
    const newJob = { _id: Date.now().toString(), ...req.body, createdAt: new Date() };
    memoryJobs.unshift(newJob);
    return res.json(newJob);
  } catch (err) {
    const newJob = { _id: Date.now().toString(), ...req.body, createdAt: new Date() };
    memoryJobs.unshift(newJob);
    return res.json(newJob);
  }
});

// 3. PUT - Update job by ID
app.put('/api/jobs/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(updatedJob);
    }
    const idx = memoryJobs.findIndex((j) => j._id === req.params.id);
    if (idx !== -1) {
      memoryJobs[idx] = { ...memoryJobs[idx], ...req.body };
      return res.json(memoryJobs[idx]);
    }
    return res.json(req.body);
  } catch (err) {
    return res.json(req.body);
  }
});

// 4. DELETE - Delete job by ID
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Job.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Job deleted' });
    }
    memoryJobs = memoryJobs.filter((j) => j._id !== req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    memoryJobs = memoryJobs.filter((j) => j._id !== req.params.id);
    return res.json({ message: 'Job deleted' });
  }
});

// 5. POST - Submit an application for a job/internship
app.post('/api/applications', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const newApp = new Application(req.body);
      const savedApp = await newApp.save();
      return res.json(savedApp);
    }
    const newApp = { _id: Date.now().toString(), ...req.body, appliedAt: new Date() };
    memoryApps.unshift(newApp);
    return res.json(newApp);
  } catch (err) {
    const newApp = { _id: Date.now().toString(), ...req.body, appliedAt: new Date() };
    memoryApps.unshift(newApp);
    return res.json(newApp);
  }
});

// 6. GET - Read all applications (newest first)
app.get('/api/applications', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const apps = await Application.find().sort({ appliedAt: -1 });
      return res.json(apps);
    }
    return res.json(memoryApps);
  } catch (err) {
    return res.json(memoryApps);
  }
});

// Start Server locally
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
