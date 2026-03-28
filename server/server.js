require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/support-ticket-system')
.then(async () => {
  console.log('MongoDB Connected');
  await ensureAdminExists();
})
.catch(err => console.log('MongoDB Connection Error:', err));

async function ensureAdminExists() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  
  const adminEmail = 'admin@gmail.com';
  const adminExists = await User.findOne({ email: adminEmail });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Default Admin Account Created: admin@gmail.com / admin123');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});