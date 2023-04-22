import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function dailyRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const table = await knex('sqlite_schema').select('*')
    return table
  })
}
