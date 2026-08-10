import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production");
  }
  return "development-only-change-me";
}

/**
 * Hash a password using PBKDF2 with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored PBKDF2 salt:hash
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(":")) return false;
  const [salt, storedHash] = combinedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(hash, "hex"));
}

/**
 * Generate a HMAC signed session token
 */
export function createSessionToken(payload: { userId: string; email: string; name: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Data = Buffer.from(data).toString("base64url");
  const signature = crypto.createHmac("sha256", getJwtSecret()).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verify HMAC signed session token
 */
export function verifySessionToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [base64Data, signature] = token.split(".");
    const expectedSignature = crypto.createHmac("sha256", getJwtSecret()).update(base64Data).digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to get currently authenticated admin user from Next.js server request
 */
export async function getAuthenticatedAdmin(request?: Request) {
  try {
    let token: string | undefined;

    // Check cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (sessionCookie?.value) {
      token = sessionCookie.value;
    }

    // Check Authorization header fallback
    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.userId }
    });

    if (!admin) return null;

    const { password, ...safeAdmin } = admin;
    return safeAdmin;
  } catch (err) {
    return null;
  }
}
