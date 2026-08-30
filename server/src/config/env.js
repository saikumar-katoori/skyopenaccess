import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isProduction = process.env.NODE_ENV === "production";

const requiredInAllEnvs = ["MONGODB_URI"];
const requiredInProdOnly = [
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLIENT_ORIGIN",
  "MAILGUN_API_KEY",
  "MAILGUN_DOMAIN"
];

const required = isProduction
  ? [...requiredInAllEnvs, ...requiredInProdOnly]
  : requiredInAllEnvs;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

if (!isProduction) {
  const missingDevConfig = requiredInProdOnly.filter((key) => !process.env[key]);
  if (missingDevConfig.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `Missing optional development env vars: ${missingDevConfig.join(", ")}. Some features may be disabled.`
    );
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/journal_management",
  jwtSecret: process.env.JWT_SECRET || "dev_only_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || ""
  },
  adminSetupKey: process.env.ADMIN_SETUP_KEY || "",
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || "",
    domain: process.env.MAILGUN_DOMAIN || "",
    from: process.env.MAILGUN_FROM || "Sky Open Access <no-reply@skyopenaccess.com>"
  }
};
