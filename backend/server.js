import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";
import responseRoutes from "./routes/response.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import session from "express-session";



dotenv.config();

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);
app.use(formRoutes);
app.use(responseRoutes);
app.use(webhookRoutes);

app.get("/", (req, res) => res.json({ message: "Airtable Form Builder backend running" }));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const port = process.env.PORT || 9080;
    app.listen(port, () => {
      console.log("server is on bhai ", port);
    });
  } catch (err) {
    console.error("failed to start", err.message);
    process.exit(1);
  }
};

start();
