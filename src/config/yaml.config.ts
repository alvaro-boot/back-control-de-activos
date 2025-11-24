import { readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

export interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  qr: {
    baseUrl: string;
  };
  frontend?: {
    url: string;
  };
  email?: {
    provider?: string;
    from?: string;
    fromName?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    password?: string;
    apiKey?: string;
  };
}

let configCache: Config | null = null;

export function loadYamlConfig(): Config {
  if (configCache) {
    return configCache;
  }

  const configPath = join(process.cwd(), 'config.yaml');
  
  try {
    const fileContents = readFileSync(configPath, 'utf8');
    const config = load(fileContents) as Config;
    
    // Validar que la configuración tenga la estructura correcta
    if (!config.server || !config.database || !config.jwt || !config.qr) {
      throw new Error('Configuración YAML incompleta. Verifica que tenga todas las secciones requeridas.');
    }
    
    configCache = config;
    return config;
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        `Archivo config.yaml no encontrado en ${configPath}. ` +
        `Copia config.yaml.example a config.yaml y configura los valores.`
      );
    }
    throw new Error(`Error al cargar config.yaml: ${error?.message || String(error)}`);
  }
}

