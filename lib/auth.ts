// lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma'



export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite"
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  
  // Session config
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update every day
  },
  
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-me',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
})