// CONEXION CON LA BASE DE DATOS POSTGRESQL

import Pool from 'pg-pool';

import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
};

const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log("Error durante la conexión", err);
  } else {
    console.log("Conexión exitosa");
  }
})

export { pool, dbConfig }
export default pool;