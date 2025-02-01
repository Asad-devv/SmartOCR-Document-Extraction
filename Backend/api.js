const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');  // Path to your authRoutes

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());  // To parse JSON bodies

app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect('mongodb+srv://ullah4406732:asad1234@cluster0.ix8cw.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
