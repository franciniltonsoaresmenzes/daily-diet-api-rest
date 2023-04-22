// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string
      email: string
      password: string
    }
    snack: {
      id: string
      session_id: string
      name: string
      description: string
      create_at: string
      is_in_diet: boolean
    }
  }
}
