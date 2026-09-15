import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE CALLBACK:", process.env.GOOGLE_CALLBACK_URL);
import app from "./src/app.js";
import pool from "./src/db/db.js";
import http from "http";

import {
  initSocket,
} from "./src/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
};

console.log(process.env.GEMINI_API_KEY);
startServer();