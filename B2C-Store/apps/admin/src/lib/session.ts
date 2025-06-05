import "server-only";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("Environment variable JWT_SECRET is not defined.");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function decrypt(session: string | undefined = "") {
  if (!session) return null; // This line to prevent errors on empty/missing cookies
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Session decryption error:", error);
    return null;
  }
}