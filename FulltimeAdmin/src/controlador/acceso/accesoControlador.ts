import { Request, Response } from 'express';
import pool from '../../database';
import Pool from 'pg-pool';
import { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class AccesoControlador {

    public async ActualizarAccesoWeb(req: Request, res: Response){
        try {
            let id_empresa_bdd_ = req.body.id_empresa_bdd;
            let web_access = req.body.web_access;

            const EMPRESA = await pool.query(
                `
                SELECT 
                    id_empresa_bdd, 
                    id_empresa, 
                    empresa_bdd_nombre, 
                    empresa_bdd_host, 
                    empresa_bdd_puerto, 
                    empresa_bdd_descripcion, 
                    empresa_bdd_usuario, 
                    empresa_bdd_contrasena 
                FROM empresa_bdd 
                WHERE id_empresa_bdd = $1
                `
                ,
                [id_empresa_bdd_]
            );

            if(EMPRESA.rowCount != 0){
                let id_empresa_bdd_database = EMPRESA.rows[0].id_empresa_bdd;
                let id_empresa_database = EMPRESA.rows[0].id_empresa;
                
                let empresa_bdd_nombre_database = EMPRESA.rows[0].empresa_bdd_nombre;
                let empresa_bdd_host_database = EMPRESA.rows[0].empresa_bdd_host;
                let empresa_bdd_password_database = FUNCIONES_LLAVES.desencriptarDatos(EMPRESA.rows[0].empresa_bdd_contrasena);
                let empresa_bdd_port_database = EMPRESA.rows[0].empresa_bdd_puerto;
                let empresa_bdd_user_database = EMPRESA.rows[0].empresa_bdd_usuario;

                const dbConfigWebAccess = {
                    user: empresa_bdd_user_database,
                    host: empresa_bdd_host_database,
                    port: Number(empresa_bdd_port_database),
                    database: empresa_bdd_nombre_database,
                    password: empresa_bdd_password_database
                }
                  
                const poolAccess = new Pool(dbConfigWebAccess);

                await poolAccess.query(
                    `
                        UPDATE eu_empleados SET web_access = $1
                    `
                    ,
                    [web_access]
                );

                res.jsonp({ message: 'Registros actualizado.' });

                //res.status(500).jsonp({ message: 'error' });
                //return { error: 'Error en la actualizacion de Acceso a la aplicacion web.'}
            }
        } catch (error) {
            res.status(500).jsonp({ message: error });
        }
    }

}

export const accesoControlador = new AccesoControlador;
export default accesoControlador;