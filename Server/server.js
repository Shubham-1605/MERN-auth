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

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const isAllowed =
      origin === "http://localhost:5173" ||
      origin === "http://localhost:4000" ||
      /^https:\/\/mern-auth[a-z0-9-]*\.vercel\.app$/.test(origin) || // ✅ All mern-auth Vercel URLs
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);  // ✅ Env var fallback

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`); // helpful for debugging
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

// ✅ Handle preflight requests explicitly (critical for Render deployments)
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// API endpoints
app.get("/", (req, res) => res.send("API working fine"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;