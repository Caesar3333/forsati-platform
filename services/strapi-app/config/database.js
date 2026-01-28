// © 2026 Forsati. All rights reserved.
// Strapi Database Configuration

module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'forsati_db'),
      user: env('DATABASE_USERNAME', 'forsati'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false),
    },
    debug: false,
  },
});
