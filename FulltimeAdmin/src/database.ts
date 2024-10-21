// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const dbConfig = {
  user: 'postgres', // postgres
  host: '192.168.0.148',
  port: 5432,
  database: 'fulltime4_pruebas_empresa',
  password: 'fu11tim3'
}

const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err);
  } else {
    console.log("Conexión exitosa");
  }
})

export {pool, dbConfig}
export default pool;