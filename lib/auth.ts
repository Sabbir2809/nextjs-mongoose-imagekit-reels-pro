import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";

export const authOptions: NextAuthOptions = {
  // providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter Your Email" },
        password: { label: "Password", type: "password" },
      },

      // logic
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Messing Email and Password");
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No User Found!");
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid Password!");
          }

          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  // callback
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // session
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  // pages
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // secret
  secret: process.env.NEXTAUTH_SECRET,
};
