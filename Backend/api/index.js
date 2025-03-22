require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("../routes/auth.js");
const shapeRoutes = require("../routes/shapes.js");
const pdfRoutes = require("../routes/pdf.js");
const templateRoutes = require("../routes/template.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/api/auth", authRoutes);
app.use("/api/shape", shapeRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/template", templateRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
