// © 2026 Forsati. All rights reserved.
// NextAuth.js Configuration with Keycloak Provider

import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User,
} from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

// Extend types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      locale?: string;
    };
  }

  interface User {
    id: string;
    role?: string;
    locale?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    role?: string;
    locale?: string;
  }
}

// Refresh access token using Keycloak
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Keycloak (Primary SSO)
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      authorization: {
        params: {
          scope: "openid email profile roles",
        },
      },
    }),

    // Google (Social Login)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Credentials (Email/Password via Keycloak)
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Authenticate via Keycloak Resource Owner Password Grant
          const tokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

          const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID!,
              client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
              grant_type: "password",
              username: credentials.email,
              password: credentials.password,
              scope: "openid email profile roles",
            }),
          });

          const tokens = await response.json();

          if (!response.ok) {
            console.error("Keycloak auth error:", tokens);
            return null;
          }

          // Decode the access token to get user info
          const payload = JSON.parse(
            Buffer.from(tokens.access_token.split(".")[1], "base64").toString(),
          );

          return {
            id: payload.sub,
            name: payload.name || payload.preferred_username,
            email: payload.email,
            image: payload.picture,
            role: payload.realm_access?.roles?.[0] || "candidate",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpires: Date.now() + tokens.expires_in * 1000,
          } as any;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        // For OAuth providers (Keycloak, Google)
        if (account.access_token) {
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            accessTokenExpires: account.expires_at
              ? account.expires_at * 1000
              : undefined,
            role: (user as any).role || "candidate",
            locale: (user as any).locale || "ar",
          };
        }
        // For credentials provider (tokens already on user)
        if ((user as any).accessToken) {
          return {
            ...token,
            accessToken: (user as any).accessToken,
            refreshToken: (user as any).refreshToken,
            accessTokenExpires: (user as any).accessTokenExpires,
            role: (user as any).role || "candidate",
          };
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        accessToken: token.accessToken,
        error: token.error,
        user: {
          ...session.user,
          id: token.sub || "",
          role: token.role,
          locale: token.locale,
        },
      };
    },

    async redirect({ url, baseUrl }) {
      // Handle redirect after login
      // Support ?next= parameter for redirect after auth
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/auth/register",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account }) {
      // Track sign-in event
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ token }) {
      // Logout from Keycloak as well
      if (token?.accessToken) {
        try {
          await fetch(
            `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                refresh_token: token.refreshToken || "",
              }),
            },
          );
        } catch (error) {
          console.error("Keycloak logout error:", error);
        }
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
