import fastify from 'fastify'
import { dailyRoutes } from './router/daily'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(dailyRoutes, { prefix: 'daily' })
