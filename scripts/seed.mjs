import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const required = ["DATABASE_URL", "DIRECT_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_NAME"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

try {
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name: process.env.ADMIN_NAME,
      password: hashPassword(process.env.ADMIN_PASSWORD)
    },
    create: {
      email,
      name: process.env.ADMIN_NAME,
      password: hashPassword(process.env.ADMIN_PASSWORD),
      role: "ADMIN"
    }
  });
  console.log(`Admin user ready: ${admin.email}`);
} finally {
  await prisma.$disconnect();
}
