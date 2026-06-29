"use server";

import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function login(credentials: unknown) {
  try {
    const validatedCredentials = loginSchema.parse(credentials);

    await signIn("credentials", {
      email: validatedCredentials.email,
      password: validatedCredentials.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "An error occurred during login" };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
