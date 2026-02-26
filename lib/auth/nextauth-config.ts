import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, oauthAccounts } from "@/lib/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    newUser: "/auth/complete-profile",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
          });

          if (!user || !user.password) {
            throw new Error("No user found or invalid login method");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.profileImage,
          };
        } catch (error) {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        // Check if user exists with this email
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!),
        });

        if (!existingUser) {
          // Create new user with OAuth provider
          const newUser = await db
            .insert(users)
            .values({
              email: user.email!,
              firstName: user.name?.split(" ")[0] || "User",
              lastName: user.name?.split(" ").slice(1).join(" ") || "",
              profileImage: user.image,
              isEmailVerified: true,
              oauthProvider: account.provider,
              googleId: account.provider === "google" ? account.providerAccountId : undefined,
              appleId: account.provider === "apple" ? account.providerAccountId : undefined,
              role: "client",
              status: "active",
            })
            .returning();

          // Store OAuth account details
          if (newUser[0]) {
            await db.insert(oauthAccounts).values({
              userId: newUser[0].id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.type,
              scope: account.scope,
              idToken: account.id_token,
            });
          }
        } else {
          // Link OAuth account to existing user if not already linked
          const existingAccount = await db.query.oauthAccounts.findFirst({
            where: eq(oauthAccounts.userId, existingUser.id),
          });

          if (!existingAccount) {
            await db.insert(oauthAccounts).values({
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.type,
              scope: account.scope,
              idToken: account.id_token,
            });

            // Update user OAuth provider info
            const oauthProvider =
              account.provider === "google" ? "google" : "apple";
            await db
              .update(users)
              .set({
                oauthProvider,
                googleId:
                  account.provider === "google"
                    ? account.providerAccountId
                    : existingUser.googleId,
                appleId:
                  account.provider === "apple"
                    ? account.providerAccountId
                    : existingUser.appleId,
              })
              .where(eq(users.id, existingUser.id));
          }
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "client";
      }

      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log(`[Auth] User ${user.email} signed in via ${account?.provider}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
};
