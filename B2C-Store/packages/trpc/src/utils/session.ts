import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error("Environment variable JWT_SECRET is not defined.");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, cookieName = "session_web") {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt });

    const cookieStore = await cookies();
    await cookieStore.set(cookieName, session, {
        httpOnly: true,
        secure: true, // Only allow HTTPS
        sameSite: "lax", // Lax is safe for most cases
        path: "/",
        expires: expiresAt,
    });
}

export async function deleteSession(cookieName = "session_web") {
    const cookieStore = await cookies();
    await cookieStore.delete(cookieName);
}

type SessionPayload = {
    userId: string;
    expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

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

// Get the current session from the session_web cookie (server-side only)
export async function getSession(cookieName = "session_web") {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(cookieName)?.value;
    if (!sessionCookie) return null;
    return decrypt(sessionCookie);
}