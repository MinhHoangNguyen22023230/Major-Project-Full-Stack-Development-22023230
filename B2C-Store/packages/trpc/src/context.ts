import { prisma } from "@repo/db";

export function createContext() {
  return { prisma };
}