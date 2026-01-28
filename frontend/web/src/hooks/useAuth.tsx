// © 2026 Forsati. All rights reserved.
// Authentication hooks and utilities

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export type UserRole =
  | "guest"
  | "candidate"
  | "recruiter"
  | "org_admin"
  | "moderator"
  | "admin";

interface UseAuthReturn {
  // State
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
  accessToken?: string;

  // Actions
  login: (
    provider?: string,
    options?: { callbackUrl?: string },
  ) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithRedirect: () => void;

  // Role checks
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
}

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user.role as UserRole) || "candidate",
    };
  }, [session]);

  // Login with OAuth provider
  const login = useCallback(
    async (provider = "keycloak", options?: { callbackUrl?: string }) => {
      const callbackUrl = options?.callbackUrl || pathname || "/";
      await signIn(provider, { callbackUrl });
    },
    [pathname],
  );

  // Login with email/password
  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
        return false;
      }

      return true;
    },
    [],
  );

  // Logout
  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  // Redirect to login with current path as callback
  const loginWithRedirect = useCallback(() => {
    const callbackUrl = encodeURIComponent(pathname || "/");
    router.push(`/auth/login?next=${callbackUrl}`);
  }, [pathname, router]);

  // Check if user has specific role(s)
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user],
  );

  // Role shortcuts
  const isCandidate = user?.role === "candidate";
  const isRecruiter = user?.role === "recruiter";
  const isOrgAdmin = user?.role === "org_admin";
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return {
    user,
    isAuthenticated,
    isLoading,
    error: session?.error,
    accessToken: session?.accessToken,
    login,
    loginWithCredentials,
    logout,
    loginWithRedirect,
    hasRole,
    isCandidate,
    isRecruiter,
    isOrgAdmin,
    isAdmin,
  };
}

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth(options?: {
  role?: UserRole | UserRole[];
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading, user, hasRole, loginWithRedirect } =
    useAuth();
  const router = useRouter();

  const isAuthorized = useMemo(() => {
    if (isLoading) return undefined; // Still loading
    if (!isAuthenticated) return false;
    if (options?.role && !hasRole(options.role)) return false;
    return true;
  }, [isLoading, isAuthenticated, options?.role, hasRole]);

  // Redirect effect handled by caller
  const redirect = useCallback(() => {
    if (isAuthorized === false) {
      if (!isAuthenticated) {
        loginWithRedirect();
      } else if (options?.redirectTo) {
        router.push(options.redirectTo);
      } else {
        router.push("/403"); // Forbidden
      }
    }
  }, [
    isAuthorized,
    isAuthenticated,
    loginWithRedirect,
    router,
    options?.redirectTo,
  ]);

  return {
    isAuthorized,
    isLoading,
    user,
    redirect,
  };
}

/**
 * Higher-order component for protected pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { role?: UserRole | UserRole[] },
) {
  return function ProtectedComponent(props: P) {
    const { isAuthorized, isLoading, redirect } = useRequireAuth(options);

    // Redirect if not authorized
    if (isAuthorized === false) {
      redirect();
      return null;
    }

    // Show loading state
    if (isLoading || isAuthorized === undefined) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default useAuth;
