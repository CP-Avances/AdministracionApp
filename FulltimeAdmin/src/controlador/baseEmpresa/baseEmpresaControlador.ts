import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';
import RsaKeyService, { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class BaseEmpresaControlador {

    public async RegistrarEmpresas(req: Request, res: Response) {
        let id_empresa_ = req.body.id_empresa;
        let empresa_bdd_nombre_ = req.body.empresa_bdd_nombre;
        let empresa_bdd_host_ = req.body.empresa_bdd_host;
        let empresa_bdd_puerto_ = req.body.empresa_bdd_puerto;
        let empresa_bdd_descripcion_ = req.body.empresa_bdd_descripcion;
        let empresa_bdd_usuario_ = req.body.empresa_bdd_usuario;
        let empresa_bdd_contrasena_ = req.body.empresa_bdd_contrasena;

        try {

            let contrasenaEncriptada = FUNCIONES_LLAVES.encriptarDatos(empresa_bdd_contrasena_);
            const response: QueryResult = await pool.query(
                `
                INSERT INTO empresa_bdd (id_empresa, empresa_bdd_nombre, empresa_bdd_host, empresa_bdd_puerto, 
                empresa_bdd_descripcion, empresa_bdd_usuario, empresa_bdd_contrasena) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
                `,
                [id_empresa_, empresa_bdd_nombre_, empresa_bdd_host_, empresa_bdd_puerto_,
                    empresa_bdd_descripcion_, empresa_bdd_usuario_, contrasenaEncriptada]
            );

            const [registro_empresa] = response.rows;

            if (registro_empresa) {
                return res.status(200).jsonp({ message: 'ok' });
            } else {
                return res.status(404).jsonp({ message: 'error' });
            }

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async ObtenerBaseEmpresas(req: Request, res: Response) {
        try {
            const EMPRESAS = await pool.query(
                `
                SELECT 
                    empresa_bdd.id_empresa_bdd, 
                    empresa_bdd.id_empresa, 
                    empresa_bdd.empresa_bdd_nombre, 
                    empresa_bdd.empresa_bdd_host, 
                    empresa_bdd.empresa_bdd_puerto, 
                    empresa_bdd.empresa_bdd_descripcion, 
                    empresa.empresa_descripcion
                FROM empresa_bdd empresa_bdd 
                INNER JOIN empresa empresa ON empresa_bdd.id_empresa = empresa.empresa_id 
                ORDER BY empresa.empresa_descripcion 
                `
            );

            if (EMPRESAS.rowCount !== null) {
                if (EMPRESAS.rowCount > 0) {
                    return res.jsonp(EMPRESAS.rows);
                } else {
                    res.status(404).jsonp({ message: 'vacio' });
                }
            } else {
                res.status(500).jsonp({ message: 'error' });
            }
        }
        catch (error) {
            res.status(500).jsonp({ message: 'error' });
        }
    }

    public async ObtenerBaseEmpresasInformacion(req: Request, res: Response) {

        try {

            const BDD_ADMINISTRACION = process.env.BDD_ADMINISTRACION || 'administrar_fulltime';

            const EMPRESAS = await pool.query(
                `
            SELECT 
                pg_database.oid AS num_proceso,

                empresas_bdd.empresa_bdd_nombre AS nombre_bdd,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN pg_size_pretty(pg_database_size(pg_database.datname))
                    ELSE 'Servidor remoto'
                END AS tamano_bdd,

                empresa.empresa_id,
                empresa.empresa_descripcion,

                empresas_bdd.id_empresa_bdd,
                empresas_bdd.empresa_bdd_descripcion,
                empresas_bdd.empresa_bdd_usuario,

                empresa.numero_relojes,
                empresa.estado,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN 'LOCAL'
                    ELSE 'REMOTA'
                END AS tipo_base

            FROM empresa_bdd AS empresas_bdd

            INNER JOIN empresa AS empresa 
                ON empresa.empresa_id = empresas_bdd.id_empresa

            LEFT JOIN pg_database 
                ON pg_database.datname = empresas_bdd.empresa_bdd_nombre

            WHERE empresas_bdd.empresa_bdd_nombre NOT IN (
                'postgres', 
                'template1', 
                'template0',
                $1
            )

            ORDER BY 
                empresa.estado DESC,
                tipo_base ASC,
                empresa.empresa_descripcion ASC;
            `,
                [BDD_ADMINISTRACION]
            );

            if (EMPRESAS.rowCount && EMPRESAS.rowCount > 0) {
                return res.jsonp(EMPRESAS.rows);
            }

            return res.status(404).jsonp({ message: 'vacio' });

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async BuscarBaseEmpresas(req: Request, res: Response) {
        try {
            const BDD_ADMINISTRACION = process.env.BDD_ADMINISTRACION || 'administrar_fulltime';

            const nombre_bdd_ = `%${req.body.nombre_bdd || ''}%`;
            const nombre_empresa_ = `%${req.body.nombre_empresa || ''}%`;

            const EMPRESAS = await pool.query(
                `
            SELECT 
                pg_database.oid AS num_proceso,

                empresas_bdd.empresa_bdd_nombre AS nombre_bdd,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN pg_size_pretty(pg_database_size(pg_database.datname))
                    ELSE 'Servidor remoto'
                END AS tamano_bdd,

                empresa.empresa_id,
                empresa.empresa_descripcion,

                empresas_bdd.id_empresa_bdd,
                empresas_bdd.empresa_bdd_descripcion,

                empresa.numero_relojes,
                empresa.estado,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN 'LOCAL'
                    ELSE 'REMOTA'
                END AS tipo_base

            FROM empresa_bdd AS empresas_bdd

            INNER JOIN empresa AS empresa 
                ON empresa.empresa_id = empresas_bdd.id_empresa

            LEFT JOIN pg_database 
                ON pg_database.datname = empresas_bdd.empresa_bdd_nombre

            WHERE empresas_bdd.empresa_bdd_nombre NOT IN (
                'postgres', 
                'template1', 
                'template0',
                $1
            )
            AND (
                empresa.empresa_descripcion ILIKE $2 
                OR empresas_bdd.empresa_bdd_nombre ILIKE $3
            )

            ORDER BY 
                empresa.estado DESC,
                tipo_base ASC,
                empresa.empresa_descripcion ASC;
            `,
                [BDD_ADMINISTRACION, nombre_empresa_, nombre_bdd_]
            );

            if (EMPRESAS.rowCount && EMPRESAS.rowCount > 0) {
                return res.jsonp(EMPRESAS.rows);
            }

            return res.status(404).jsonp({ message: 'vacio' });

        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async BuscarBaseEmpresasPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const EMPRESAS = await pool.query(
                `
                SELECT 
                    empresa.id_empresa_bdd, 
                    empresa.id_empresa, 
                    empresa.empresa_bdd_nombre, 
                    empresa.empresa_bdd_host, 
                    empresa.empresa_bdd_puerto,
                    empresa.empresa_bdd_descripcion, 
                    empresa.empresa_bdd_contrasena,
                    empresa.empresa_bdd_usuario
                FROM empresa_bdd empresa
                WHERE 
                    empresa.id_empresa = $1
                ORDER BY 1
                `,
                [id]
            );

            if (EMPRESAS.rowCount !== null) {
                if (EMPRESAS.rowCount > 0) {
                    res.jsonp(EMPRESAS.rows);
                } else {
                    res.status(404).jsonp({ message: 'vacio' });
                }
            } else {
                res.status(500).jsonp({ message: 'error' });
            }

        }
        catch (error) {
            res.status(500).jsonp({ message: 'error' });
        }
    }

    public async ActualizarBaseEmpresa(req: Request, res: Response) {
        let id_empresa_bdd_ = req.body.id_empresa_bdd;
        let id_empresa_ = req.body.id_empresa;
        let empresa_bdd_nombre_ = req.body.empresa_bdd_nombre;
        let empresa_bdd_host_ = req.body.empresa_bdd_host;
        let empresa_bdd_puerto_ = req.body.empresa_bdd_puerto;
        let empresa_bdd_descripcion_ = req.body.empresa_bdd_descripcion;
        let empresa_bdd_usuario_ = req.body.empresa_bdd_usuario;
        let empresa_bdd_contrasena_ = req.body.empresa_bdd_contrasena;

        try {

            var contrasenaEncriptada = RsaKeyService.encriptarDatos(empresa_bdd_contrasena_);

            await pool.query(
                `
                UPDATE empresa_bdd SET id_empresa = $1, empresa_bdd_nombre = $2, empresa_bdd_host = $3, 
                empresa_bdd_puerto = $4, empresa_bdd_descripcion = $5, empresa_bdd_usuario = $6, 
                empresa_bdd_contrasena = $7  
                WHERE id_empresa_bdd = $8 
                `,
                [id_empresa_, empresa_bdd_nombre_, empresa_bdd_host_, empresa_bdd_puerto_,
                    empresa_bdd_descripcion_, empresa_bdd_usuario_, contrasenaEncriptada, id_empresa_bdd_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error) {
            return res.jsonp({ message: error });
        }
    }

    public async EliminarEmpresa(req: Request, res: Response) {
        try {
            let id_empresa_bdd_ = req.body.id_empresa_bdd;

            await pool.query(
                `
                DELETE FROM empresa_bdd WHERE id_empresa_bdd = $1
                `
                , [id_empresa_bdd_]
            );

            res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

}

export const baseEmpresaControlador = new BaseEmpresaControlador;
export default baseEmpresaControlador;