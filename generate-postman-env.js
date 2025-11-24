const fs = require('fs');

const environment = {
  id: 'control-activos-env',
  name: 'Control de Activos - Entorno',
  values: [
    {
      key: 'base_url',
      value: 'http://localhost:3000',
      type: 'default',
      enabled: true
    },
    {
      key: 'token',
      value: '',
      type: 'secret',
      enabled: true
    },
    {
      key: 'refreshToken',
      value: '',
      type: 'secret',
      enabled: true
    },
    {
      key: 'empresaId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'activoId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'empleadoId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'usuarioId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'sedeId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'areaId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'categoriaId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'proveedorId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'tecnicoId',
      value: '1',
      type: 'default',
      enabled: true
    },
    {
      key: 'rolId',
      value: '1',
      type: 'default',
      enabled: true
    }
  ],
  _postman_variable_scope: 'environment'
};

fs.writeFileSync(
  'Control-de-Activos-Environment.postman_environment.json',
  JSON.stringify(environment, null, 2),
  'utf8'
);

console.log('✅ Archivo de entorno de Postman creado exitosamente: Control-de-Activos-Environment.postman_environment.json');

