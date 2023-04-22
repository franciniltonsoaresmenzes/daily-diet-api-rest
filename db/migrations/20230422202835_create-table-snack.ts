import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('snack', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').index()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.string('create_at').notNullable()
    table.boolean('is_in_diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('snack')
}
