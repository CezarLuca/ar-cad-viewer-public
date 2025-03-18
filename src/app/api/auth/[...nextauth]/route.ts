import NextAuth from "next-auth";
import type { User, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Find user in database
                    const users =
                        await sql`SELECT * FROM users WHERE email = ${credentials.email}`;

                    const user = users[0];

                    if (!user || !user.password) {
                        return null;
                    }

                    // Compare passwords
                    const passwordMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );

                    if (!passwordMatch) {
                        return null;
                    }

                    // Return user without password
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User | undefined }) {
            if (user) {
                token.role = user.role;
                token.id = user.id; //  include ID in token
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        // signOut: '/auth/signout',
        // error: '/auth/error',
    },
    session: {
        strategy: "jwt" as const,
    },
};

// Create the handler and export as GET/POST:
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
