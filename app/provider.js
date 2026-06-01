"use client";
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
export default function Provider({ children, session }) {
    return (
        <SessionProvider session={session}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </SessionProvider>
    );
}
