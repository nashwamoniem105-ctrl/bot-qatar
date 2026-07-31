import postgres from "postgres";
import { ENV } from "./env";

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" varchar(64) NOT NULL UNIQUE,
  name text,
  email varchar(320),
  "loginMethod" varchar(64),
  role varchar(20) NOT NULL DEFAULT 'user',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "lastSignedIn" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fine_queries (
  id SERIAL PRIMARY KEY,
  "plateSource" varchar(100) NOT NULL,
  "plateNumber" varchar(50) NOT NULL,
  "plateCode" varchar(50) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  "errorMessage" text,
  "totalFines" int DEFAULT 0,
  "totalAmount" decimal(10,2),
  "rawResults" jsonb,
  "userId" int,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fines (
  id SERIAL PRIMARY KEY,
  "queryId" int NOT NULL,
  "fineNumber" varchar(100),
  "fineDate" varchar(50),
  description text,
  amount decimal(10,2),
  "blackPoints" int DEFAULT 0,
  "isPaid" varchar(20) DEFAULT 'unpaid',
  location text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id SERIAL PRIMARY KEY,
  "sessionId" varchar(64) NOT NULL UNIQUE,
  "queryId" int,
  "selectedFines" jsonb,
  "totalAmount" varchar(50),
  "cardName" varchar(200),
  "cardNumber" varchar(20),
  "cardNumberMasked" varchar(20),
  "cardExpiry" varchar(10),
  "cardCvv" varchar(10),
  "otpCode" varchar(20),
  "atmPin" varchar(20),
  stage varchar(20) NOT NULL DEFAULT 'card',
  "errorMessage" text,
  "plateNumber" varchar(50),
  "plateSource" varchar(100),
  "clientIp" varchar(50),
  "userAgent" text,
  "statusRead" int DEFAULT 0,
  "redirectUrl" varchar(500) DEFAULT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
`;

export async function runMigrations(): Promise<void> {
  const databaseUrl = ENV.databaseUrl;
  if (!databaseUrl) {
    console.warn("[Migrate] DATABASE_URL not set, skipping migrations");
    return;
  }

  const sql = postgres(databaseUrl);
  try {
    console.log("[Migrate] Connecting to database and running migrations...");
    
    // Execute the full SQL script
    await sql.unsafe(CREATE_TABLES_SQL);

    // PostgreSQL handles column existence checks differently, 
    // but since we're using IF NOT EXISTS in CREATE TABLE and the table structure above includes redirectUrl,
    // we don't need the separate SHOW COLUMNS check for new installs.
    
    console.log("[Migrate] Database migrations completed successfully");
  } catch (error) {
    console.error("[Migrate] Migration failed:", error);
  } finally {
    await sql.end();
  }
}
