import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { authenticateUser } from "@/lib/services/auth-service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  basePath: '/api/auth',
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    // Admin credentials provider
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[NextAuth] Admin authorize called');
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          return null;
        }

        // Check AdminUser table for admin logins
        const adminUser = await db.adminUser.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!adminUser) {
          console.log('[NextAuth] Admin user not found');
          return null;
        }

        // Dynamically import bcryptjs to avoid loading it at module level
        const { compare } = await import("bcryptjs");
        const isPasswordValid = await compare(
          credentials.password as string,
          adminUser.passwordHash
        );

        if (!isPasswordValid) {
          console.log('[NextAuth] Invalid password');
          return null;
        }

        console.log('[NextAuth] Admin authentication successful:', { id: adminUser.id, email: adminUser.email });
        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.email, // AdminUser doesn't have a name field
          role: "admin",
          userType: "admin",
        };
      },
    }),
    // Pilgrim user credentials provider
    Credentials({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[NextAuth] Pilgrim authorize called');
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          throw new Error("Email and password are required");
        }

        // Use authentication service for pilgrim users
        const result = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        );

        if (!result.success || !result.user) {
          // Throw error with specific message for better UX
          console.log('[NextAuth] Authentication failed:', result.error);
          throw new Error(result.error || "Authentication failed");
        }

        console.log('[NextAuth] Authentication successful:', { id: result.user.id, email: result.user.email });
        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: "user",
          userType: "pilgrim",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Log redirect attempts for debugging
      console.log('[NextAuth] Redirect callback:', { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      // On sign in, add user data to token
      if (user) {
        console.log('[NextAuth] JWT callback - user signed in:', { id: user.id, email: user.email, userType: user.userType });
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
        token.name = user.name || '';
        if (user.email) {
          token.email = user.email;
        }
      }
      
      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      console.log('[NextAuth] Session callback - creating session:', { tokenId: token.id, tokenEmail: token.email });
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.userType = token.userType as string;
        session.user.name = (token.name as string) || '';
        session.user.email = (token.email as string) || '';
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
