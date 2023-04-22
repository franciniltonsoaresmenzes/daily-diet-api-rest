import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['developement', 'test', 'production'])
    .default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.log(process.env.DATABASE_URL)
  console.log('⚠️ Invalid enviroment variables', _env.error.format())

  throw Error('⚠️ Invalid enviroment variables')
}

export const env = _env.data
