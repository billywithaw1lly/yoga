import {z} from 'zod'

export const loginSchema = z.object ({
    email: z
        .email("invalid email"),
    
    password: z
        .string()
        .min(8, "password should be atleast 8 characters long")
})