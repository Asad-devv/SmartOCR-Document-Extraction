require('dotenv').config();  // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');  // Path to your authRoutes

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());  // To parse JSON bodies

app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
