import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const categories = await prisma.category.findMany({});
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}