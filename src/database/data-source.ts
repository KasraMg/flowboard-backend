/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as pg from 'pg';
import { DataSource } from 'typeorm';
import { validate } from '../config/env.validation';

const config = validate(process.env);

const databaseUrl = config.DATABASE_DIRECT_URL ?? config.DATABASE_URL;

export default new DataSource({
  type: 'postgres',
  driver: pg,
  url: databaseUrl,

  ssl: true,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
});
