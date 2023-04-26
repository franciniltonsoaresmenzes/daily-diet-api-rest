import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  execSync('npm run knex migrate:latest')
})

it('should create new user', async () => {
  await request(app.server)
    .post('/daily/register')
    .send({
      email: 'francinilton@gmail.com',
      password: '123456',
    })
    .expect(201)
})
