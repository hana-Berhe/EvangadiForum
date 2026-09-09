import "dotenv/config";
import mysql from "mysql2/promise";

// Mock connection pool creation if non-null connection parameters are provided
// and connection configuration should work with the schema we designed
export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASS || "Addis2026%",
  database: process.env.DB_NAME || "ai-forum",
  //   waitForConnections: true,
  //   connectionLimit: 10,
  //   queueLimit: 0,
  //   namedPlaceholders: true,
});

const ensureParams = (params) => {
  if (params === undefined || params === null) {
    throw new Error("SQL parameters are required");
  }
  const isArray = Array.isArray(params);
  const isObject = !isArray && typeof params === "object";
  if (!isArray && !isObject) {
    throw new Error("SQL parameters must be an array or object");
  }
};

export const safeExecute = async (sql, params) => {
  if (typeof sql !== "string" || sql.trim().length === 0) {
    throw new Error("SQL query must be a non-empty string");
  }
  ensureParams(params);
  const [result] = await db.execute(sql, params);
  return result;
};
