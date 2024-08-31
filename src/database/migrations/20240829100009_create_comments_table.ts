exports.up = function (knex) {
    return knex.schema.createTable('comments', (table) => {
      table.uuid('id').primary();
      table.string('videoId').references('videoId').inTable('videos').onDelete('CASCADE');
      table.text('text').notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('comments');
  };
  