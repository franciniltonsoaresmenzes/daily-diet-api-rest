import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { hashPassword } from '../functions/hashPassword'
import { comparePassword } from '../functions/comparePassword'
import { checkSessionIdExits } from '../middlewares/check-session-id-exists'

export async function dailyRoutes(app: FastifyInstance) {
  const createSnackSchema = z.object({
    name: z.string(),
    description: z.string(),
    createAt: z.string().datetime(),
    isInDiet: z.boolean(),
  })

  const getSnackParamsSchema = z.object({
    id: z.string().uuid().nonempty(),
  })

  type Snack = z.infer<typeof createSnackSchema>

  app.get('/snack', { preHandler: [checkSessionIdExits] }, async (request) => {
    const { sessionId } = request.cookies

    const snacks = await knex('snack')
      .select()
      .where<Snack[]>('session_id', sessionId)

    return { snacks }
  })
  app.get('/:id', { preHandler: [checkSessionIdExits] }, async (request) => {
    const { sessionId } = request.cookies

    const { id } = getSnackParamsSchema.parse(request.params)

    const snack = await knex('snack')
      .select()
      .where({ session_id: sessionId, id })
      .first()

    return { snack }
  })

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const { id } = getSnackParamsSchema.parse(request.params)

      await knex('snack').delete().where({ id, session_id: sessionId })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const updateSnackSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        createAt: z.string().datetime().optional(),
        isInDiet: z.boolean().optional(),
      })

      const { id } = getSnackParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const snack = updateSnackSchema.parse(request.body)
      await knex('snack').where({ id, session_id: sessionId }).update(snack)
      return reply.status(201).send()
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExits] },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await knex('snack')
        .select(
          knex.raw(
            'count(*) filter (where is_in_diet = true) as totalWithinDiet',
          ),
          knex.raw(
            'count(*) filter (where is_in_diet = false) as totalOutsideDiet',
          ),
          knex.raw('count(*) as total'),
        )
        .where({ session_id: sessionId })

      return { summary }
    },
  )

  app.post(
    '/snack',
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const { name, description, createAt, isInDiet } = createSnackSchema.parse(
        request.body,
      )

      await knex('snack').insert({
        id: randomUUID(),
        session_id: request.cookies.sessionId,
        name,
        description,
        create_at: createAt,
        is_in_diet: isInDiet,
      })

      return reply.status(201).send()
    },
  )

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

    const user = await knex('user')
      .select<User & { id: string }>()
      .where({ email })
      .first()

    const encrypted = user?.password === undefined ? '' : user?.password

    const pass = await comparePassword(password, encrypted)

    if (!pass) {
      return reply.status(401).send({ error: 'usuario invalido' })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId && user?.id !== undefined) {
      sessionId = user.id
      reply.cookie('sessionId', sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
    }

    return { login: true }
  })
}
