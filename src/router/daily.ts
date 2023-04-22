import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { hashPassword } from '../functions/hashPassword'

export async function dailyRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const table = await knex('user').select('*')
    return table
  })

  app.post('/register', async (request, reply) => {
    const createUserSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = createUserSchema.parse(request.body)

    const hash = await hashPassword(password)

    await knex('user').insert({
      id: randomUUID(),
      email,
      password: hash,
    })

    return reply.status(201).send()
  })
}
