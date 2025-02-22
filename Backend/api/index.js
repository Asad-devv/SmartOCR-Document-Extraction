require('dotenv').config();  

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth.js');
const shapeRoutes = require('../routes/shapes.js');
const pdfRoutes = require("../routes/pdf.js")
const templateRoutes = require('../routes/template.js');  // Path to your authRoutes
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());  
app.use(cors()); 

app.use('/api/auth', authRoutes);
app.use('/api/shapes', shapeRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/template', templateRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
