import { z } from "zod";
import { publicProcedure } from "../router";
import { verifyPassword } from "../utils/hash";

// Email regex for additional validation (RFC 5322 Official Standard)
const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const adminLoginInputSchema = z.object({
    email: z
        .string()
        .email("Invalid email format")
        .refine((val) => emailRegex.test(val), {
            message: "Email address is not valid",
        }),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminLoginResolverParams = {
    ctx: {
        prisma: {
            admin: {
                findUnique: (args: { where: { email: string } }) => Promise<{ id: string; hashedPassword: string } | null>;
                update: (args: { where: { id: string }; data: { lastLogin: Date } }) => Promise<unknown>;
            };
        };
    };
    input: z.infer<typeof adminLoginInputSchema>;
};

export async function adminLoginResolver({ ctx, input }: AdminLoginResolverParams) {
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

    // Update lastLogin field
    await ctx.prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
    });

    // Return only userId for session
    return { userId: admin.id };
}

export const adminLoginProcedure = publicProcedure
    .input(adminLoginInputSchema)
    .mutation(adminLoginResolver);