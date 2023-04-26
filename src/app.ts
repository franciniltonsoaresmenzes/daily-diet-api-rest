import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { dailyRoutes } from './router/daily'

export const app = fastify()

app.register(cookie)

app.register(dailyRoutes, { prefix: 'daily' })
