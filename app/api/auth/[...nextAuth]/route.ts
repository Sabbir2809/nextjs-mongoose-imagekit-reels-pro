import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handleAuth = NextAuth(authOptions);

export { handleAuth as GET, handleAuth as POST };
