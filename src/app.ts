import fastify from 'fastify'
import { dailyRoutes } from './router/daily'

export const app = fastify()

app.register(dailyRoutes, { prefix: 'daily' })
