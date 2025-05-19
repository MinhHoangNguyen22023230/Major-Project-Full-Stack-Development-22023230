import { hash, compare } from "bcryptjs";

/**
 * Hash a plain password using bcrypt.
 * @param password Plain text password
 * @returns Promise<string> Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    return hash(password, 10);
}

/**
 * Compare a plain password with a hashed password.
 * @param password Plain text password
 * @param hashed Hashed password
 * @returns Promise<boolean> True if match, false otherwise
 */
export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
    return compare(password, hashed);
}