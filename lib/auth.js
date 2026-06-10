import bcryptjs from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
                if (!user || user.status !== 'active') {
                    return null;
                }
                const valid = await bcryptjs.compare(credentials.password, user.password);
                if (!valid) {
                    return null;
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;
                
                try {
                    await connectToDatabase();
                    // Dynamically import Role to avoid circular dependency issues
                    const Role = (await import('@/models/Role')).default;
                    const roleRecord = await Role.findOne({ name: user.role });
                    if (roleRecord) {
                        token.permissions = roleRecord.permissions || [];
                    } else {
                        // Fallback permissions based on standard roles
                        const r = user.role ? user.role.toLowerCase() : '';
                        if (r === 'super admin' || r === 'superadmin') {
                            token.permissions = ['dashboard', 'products', 'orders', 'stores', 'accounting', 'users', 'settings', 'rbac', 'audit', 'store-panel'];
                        } else if (r === 'admin') {
                            token.permissions = ['dashboard', 'products', 'orders', 'users', 'settings'];
                        } else if (r === 'store manager' || r === 'manager') {
                            token.permissions = ['dashboard', 'products', 'orders', 'accounting', 'store-panel'];
                        } else if (r === 'accountant') {
                            token.permissions = ['accounting'];
                        } else {
                            token.permissions = [];
                        }
                    }
                } catch (e) {
                    console.error("Failed to load permissions during authorization", e);
                    token.permissions = [];
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
                session.user.permissions = token.permissions || [];
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
};
export default NextAuth(authOptions);
