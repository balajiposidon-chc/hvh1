import { z } from 'zod';
export const registerSchema = z.object({
    name: z.string().min(2, 'Name is required').regex(/^[a-zA-Z\s]+$/, 'Full Name can only contain letters and spaces'),
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must have at least 8 characters'),
    phone: z.string().min(1, 'Phone number is required').regex(/^\+?[0-9\s\-()]{10,15}$/, 'Invalid phone number format. Must be 10-15 digits.'),
    address: z.string().optional(),
});
export const loginSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password is required'),
});
export const productSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().min(5),
    price: z.number().positive(),
    discountPrice: z.number().nonnegative(),
    category: z.string().min(1),
    brand: z.string().min(1),
    stock: z.number().int().nonnegative(),
    images: z.array(z.string().url()).min(1),
    status: z.enum(['active', 'inactive']),
    featured: z.boolean(),
    hsnCode: z.string().optional(),
    gstRate: z.number().nonnegative().optional(),
    culinaryUses: z.string().optional(),
    storageCare: z.string().optional(),
    sourcingGuarantee: z.string().optional(),
    allergenSafety: z.string().optional(),
});
