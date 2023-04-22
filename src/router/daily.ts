import { FastifyInstance } from 'fastify'

export async function dailyRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return 'Ola Muno'
  })
}
