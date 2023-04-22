import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('snack', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').index()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.timestamp('create_at').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('snack')
}
