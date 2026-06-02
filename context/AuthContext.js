"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const router = useRouter();

  const getDefaultPermissions = (roleName) => {
    const r = roleName ? roleName.toLowerCase() : '';
    if (r === 'super admin' || r === 'superadmin') {
      return ['dashboard', 'products', 'orders', 'stores', 'accounting', 'users', 'settings', 'rbac'];
    } else if (r === 'admin') {
      return ['dashboard', 'products', 'orders', 'users', 'settings'];
    } else if (r === 'store manager' || r === 'manager') {
      return ['dashboard', 'products', 'orders'];
    } else if (r === 'accountant') {
      return ['accounting'];
    }
    return [];
  };

  const fetchPermissions = async (roleName) => {
    if (!roleName) {
      setPermissions([]);
      return;
    }
    try {
      const res = await fetch(`/api/auth/permissions?role=${encodeURIComponent(roleName)}`);
      const data = await res.json();
      if (data.success) {
        setPermissions(data.permissions);
      } else {
        setPermissions(getDefaultPermissions(roleName));
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setPermissions(getDefaultPermissions(roleName));
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
      });
      fetchPermissions(session.user.role);
    } else if (status === "unauthenticated") {
      setUser(null);
      setPermissions([]);
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
        await fetchPermissions(u.role);
        
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
    setPermissions([]);
    router.push("/login");
  };

  const loading = status === "loading";

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, loading, checkUserLoggedIn: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
