import { redirect } from "next/navigation";
/*
const testUser = {
  id: "1",
  email: "contact@cosdensolutions.io",
  password: "12345678",
};

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});
type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function login(prevState: LoginFormState, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  if (email !== testUser.email || password !== testUser.password) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  await createSession(testUser.id);

  redirect("/");
}
*/

export async function logout() {
  // Call tRPC session.deleteSession mutation via fetch (server action safe)
  await fetch("/api/trpc/session.deleteSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  redirect("/login");
}
