import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const admin = await AdminUser.findOne({ email });
        if (!admin) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        return { id: admin._id.toString(), email: admin.email };
      },
    }),
  ],
});
