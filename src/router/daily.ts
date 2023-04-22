import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { hashPassword } from '../functions/hashPassword'
import { comparePassword } from '../functions/comparePassword'

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

  app.post('/login', async (request, reply) => {
    const createUserSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    type User = z.infer<typeof createUserSchema>

    const { email, password } = createUserSchema.parse(request.body)

    const user = await knex('user').select<User>().where({ email }).first()

    const encrypted = user?.password === undefined ? '' : user?.password

    const pass = await comparePassword(password, encrypted)

    if (!pass) {
      return reply.status(401).send({ error: 'usuario invalido' })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
    }

    return { login: true }
  })
}
