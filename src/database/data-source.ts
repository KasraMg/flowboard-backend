/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { DataSource } from 'typeorm';
import { validate } from '../config/env.validation';

const config = validate(process.env);

const databaseUrl = config.DATABASE_DIRECT_URL ?? config.DATABASE_URL;

export default new DataSource({
  type: 'postgres',

  url: databaseUrl,

  ssl: true,

  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],

  synchronize: false,
});
