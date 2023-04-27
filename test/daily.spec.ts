import request from 'supertest'
import { afterAll, beforeAll, describe, it, beforeEach } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Daily routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --al')
    execSync('npm run knex migrate:latest')
  })

  const sut = () => {
    const newSnack = {
      name: 'Bolacha',
      description: 'Macarrão sintentico',
      createAt: new Date().toISOString(),
      isInDiet: false,
    }
    const user = {
      email: 'francinilton@gmail.com',
      password: '123456',
    }
    return { newSnack, user }
  }

  it('should create register daily', async () => {
    const { newSnack, user } = sut()

    await request(app.server).post('/daily/register').send(user)

    const createDailyResponse = await request(app.server)
      .post('/daily/login')
      .send(user)

    const cookie = createDailyResponse.get('Set-Cookie')

    await request(app.server)
      .post('/daily/snack')
      .set('Cookie', cookie)
      .send(newSnack)
      .expect(201)
  })

  it('should list snack', async () => {
    const { newSnack, user } = sut()

    await request(app.server).post('/daily/register').send(user)

    const createDailyResponse = await request(app.server)
      .post('/daily/login')
      .send(user)

    const cookie = createDailyResponse.get('Set-Cookie')

    await request(app.server)
      .post('/daily/snack')
      .set('Cookie', cookie)
      .send(newSnack)

    await request(app.server)
      .get('/daily/snack')
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should delete snack', async () => {
    const { newSnack, user } = sut()

    await request(app.server).post('/daily/register').send(user)

    const createDailyResponse = await request(app.server)
      .post('/daily/login')
      .send(user)

    const cookie = createDailyResponse.get('Set-Cookie')

    await request(app.server)
      .post('/daily/snack')
      .set('Cookie', cookie)
      .send(newSnack)

    const snack = await request(app.server)
      .get('/daily/snack')
      .set('Cookie', cookie)

    const snackId = snack.body.snacks[0].id

    await request(app.server)
      .delete(`/daily/${snackId}`)
      .set('Cookie', cookie)
      .expect(201)
  })

  it('should alter snack', async () => {
    const { newSnack, user } = sut()

    await request(app.server).post('/daily/register').send(user)

    const createDailyResponse = await request(app.server)
      .post('/daily/login')
      .send(user)

    const cookie = createDailyResponse.get('Set-Cookie')

    await request(app.server)
      .post('/daily/snack')
      .set('Cookie', cookie)
      .send(newSnack)

    const snack = await request(app.server)
      .get('/daily/snack')
      .set('Cookie', cookie)

    const snackId = snack.body.snacks[0].id

    await request(app.server)
      .put(`/daily/${snackId}`)
      .set('Cookie', cookie)
      .send({
        name: 'Maçã',
        isInDiet: true,
      })
      .expect(201)
  })
})
