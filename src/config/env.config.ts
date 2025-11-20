import { loadYamlConfig } from './yaml.config';

export default () => {
  const config = loadYamlConfig();

  return {
    port: config.server.port,
    database: {
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
    },
    jwt: {
      secret: config.jwt.secret,
      expiresIn: config.jwt.expiresIn,
      refreshSecret: config.jwt.refreshSecret,
      refreshExpiresIn: config.jwt.refreshExpiresIn,
    },
    qr: {
      baseUrl: config.qr.baseUrl,
    },
    nodeEnv: config.server.nodeEnv,
  };
};
