import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";  

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://mern-auth-ctfun8n83-shubham-kumars-projects-f76eb912.vercel.app",
  "https://mern-auth-orpin-mu.vercel.app",
].filter(Boolean);

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// API endpoints
app.get("/", (req, res) => res.send("API working fine"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// ✅ Fix 2: Keep listen for local dev but also export app for Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server is running on port ${port}`));
}

export default app; // ✅ Fix 3: Export app for Vercel serverless