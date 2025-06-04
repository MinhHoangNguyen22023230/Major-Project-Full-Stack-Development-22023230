import { z } from "zod";
import { publicProcedure } from "../router";
import { verifyPassword } from "../utils/hash";

// Email regex for additional validation (RFC 5322 Official Standard)
const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const adminLoginProcedure = publicProcedure
    .input(
        z.object({
            email: z
                .string()
                .email("Invalid email format")
                .refine((val) => emailRegex.test(val), {
                    message: "Email address is not valid",
                }),
            password: z.string().min(8, "Password must be at least 8 characters"),
        })
    )
    .mutation(async ({ ctx, input }) => {
        // Find admin by email
        const admin = await ctx.prisma.admin.findUnique({
            where: { email: input.email }
        });

        if (!admin) {
            throw new Error("Invalid email or password");
        }

        // Validate password using the correct util
        const valid = await verifyPassword(input.password, admin.hashedPassword);
        if (!valid) {
            throw new Error("Invalid email or password");
        }

        // Return only userId for session
        return { userId: admin.id };
    });