exports.up = function (knex) {
    return knex.schema.createTable('videos', (table) => {
      table.uuid('id')
      table.string('videoId').primary();
      table.string('title').notNullable();
      table.text('description');
      table.bigInteger('viewCount');
      table.bigInteger('likeCount');
      table.timestamps(true, true); // Adds created_at and updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('videos');
  };
  