// Loads .env before anything else.
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db } from "./schema/db.config.js";
import { mainRouter } from "./src/mainRoutes.js";
import { errorHandler, notFound } from "./src/middleware/error-handler.js";
import { PROFILE_UPLOAD_DIR } from "./src/api/profile/config/profile.upload.config.js";
import { warmQuestionTagEmbeddings } from "./src/api/question/service/question-tagging.service.js";
import { parseTrustProxy } from "./src/utility/trustProxy.js";

const app = express();

// Requests reach this app through proxies (Vercel's /api rewrite, then
// Render). "trust proxy" tells Express how many to skip so req.ip is the
// visitor's real IP, which the per-IP login rate limit depends on.
// Set TRUST_PROXY to the number measured with /api/debug/ip (default 2).
app.set("trust proxy", parseTrustProxy(process.env.TRUST_PROXY));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// Only profile photos are public. Users' PDFs (uploads/rag) are NOT served
// here; they are only reachable through GET /api/rag/documents/:id/file,
// which checks that the document belongs to the logged-in user.
app.use("/uploads/profiles", express.static(PROFILE_UPLOAD_DIR));

// Temporary check for TRUST_PROXY. Only exists when DEBUG_IP_ROUTE=true.
// Open it from your browser on the deployed site: "ip" must be your real IP.
// Turn it off again once TRUST_PROXY is right.
if (process.env.DEBUG_IP_ROUTE === "true") {
  app.get("/api/debug/ip", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({
      ip: req.ip,
      ips: req.ips,
      trustProxy: app.get("trust proxy"),
      socketAddress: req.socket?.remoteAddress,
      xForwardedFor: req.get("x-forwarded-for") ?? null,
      xRealIp: req.get("x-real-ip") ?? null,
      xVercelForwardedFor: req.get("x-vercel-forwarded-for") ?? null,
      cfConnectingIp: req.get("cf-connecting-ip") ?? null,
      trueClientIp: req.get("true-client-ip") ?? null,
    });
  });
}

//Main api
app.use("/api", mainRouter);

//  your error handler middleware should be after all api calls
app.use(notFound);
app.use(errorHandler);

// connection and server configuration
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Database connection failed. Server not started:",
      error.message,
    );
    process.exit(1);
  }
}

warmQuestionTagEmbeddings();
startServer();
