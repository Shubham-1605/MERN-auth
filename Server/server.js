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

// ✅ Manual header middleware FIRST - before everything else
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    origin === "http://localhost:5173" ||
    origin === "http://localhost:4000" ||
    /^https:\/\/mern-auth[a-z0-9-]*\.vercel\.app$/.test(origin) ||
    (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie");
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed =
      origin === "http://localhost:5173" ||
      origin === "http://localhost:4000" ||
      /^https:\/\/mern-auth[a-z0-9-]*\.vercel\.app$/.test(origin) ||
      (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.options("(.*)", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("API working fine"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;