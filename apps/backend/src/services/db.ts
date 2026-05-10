import { PrismaClient } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL environment variable')
}

const pool = new Pool({
  connectionString: databaseUrl,
})

const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
