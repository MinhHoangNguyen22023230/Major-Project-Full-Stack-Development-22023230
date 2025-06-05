import { prisma } from "@repo/db";
import { S3Utils } from "@repo/s3";

export function createContext() {
  return { prisma, S3Utils };
}