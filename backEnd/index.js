// Loads .env before anything else.
import "dotenv/config";

import express from "express";
import cors from "cors";
import { db } from "./schema/db.config.js";
import { mainRouter } from "./src/mainRoutes.js";
import { errorHandler } from "./src/middleware/error-handler.js";

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Main api
app.use("/api", mainRouter);

//  your error handler middleware should be after all api calls
app.use(errorHandler);

// connection and server configuration

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to database");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
