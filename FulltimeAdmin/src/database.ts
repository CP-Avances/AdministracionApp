// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

const dbConfig = {
  user: 'fulltime', // postgres
  host: '192.168.0.156',
  port: 5432,
  database: 'fulltime4_pruebas_empresa',
  password: 'fulltime'
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