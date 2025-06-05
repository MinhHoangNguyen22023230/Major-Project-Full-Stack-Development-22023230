import { z } from "zod";
import { publicProcedure } from "../router";
import { verifyPassword } from "../utils/hash";

// Email regex for additional validation (RFC 5322 Official Standard)
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;;

export const loginProcedure = publicProcedure
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
    // Find user by email
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Validate password using the correct util
    const valid = await verifyPassword(input.password, user.hashedPassword);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // Update lastLogin field
    await ctx.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return only userId for session
    return { userId: user.id };
  });