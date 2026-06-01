"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status]);

  const login = async ({ email, password }) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    
    if (result?.error) {
      return { success: false, message: result.error };
    }
    
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (sessionData?.user) {
        const u = sessionData.user;
        setUser(u);
        
        // Redirect based on role
        if (u.role === 'Customer') {
          router.push('/');
        } else if (u.role === 'Super Admin') {
          router.push('/superadmin-dashboard');
        } else if (u.role === 'Admin' || u.role === 'Store Manager') {
          router.push('/admin');
        } else if (u.role === 'Accountant') {
          router.push('/superadmin-dashboard/accounting');
        } else {
          router.push('/');
        }
        return { success: true };
      }
    } catch (e) {
      console.error("Session fetch failed on login", e);
    }
    
    return { success: true };
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    router.push("/login");
  };

  const loading = status === "loading";

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkUserLoggedIn: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
