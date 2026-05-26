import {z} from 'zod'

export const registrationSchama = z.object ({
    name: z
        .string()
        .min(3, "name must be atleast 3 characters"),

    email: z
        .email("invalid email"),
    
    password: z
        .string()
        .min(8, "password should be atleast 8 characters long")
})