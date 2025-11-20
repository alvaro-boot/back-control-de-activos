import { DataSource } from 'typeorm';
import { loadYamlConfig } from '../../config/yaml.config';

const config = loadYamlConfig();

export default new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
