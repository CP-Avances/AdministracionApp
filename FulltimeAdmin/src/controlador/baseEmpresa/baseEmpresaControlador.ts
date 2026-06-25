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

    public async ObtenerBaseEmpresasInformacion(req: Request, res: Response) {
        try {
            const BDD_ADMINISTRACION = process.env.BDD_ADMINISTRACION || 'administrar_fulltime';

            const EMPRESAS = await pool.query(
                `
            SELECT 
                pg_database.oid AS num_proceso,

                eb.empresa_bdd_nombre AS nombre_bdd,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN pg_size_pretty(pg_database_size(pg_database.datname))
                    ELSE 'Servidor remoto'
                END AS tamano_bdd,

                empresa.empresa_id,
                empresa.empresa_codigo,
                empresa.empresa_descripcion,
                empresa.estado,
                empresa.instalacion,
                empresa.zona_horaria,

                eb.id_empresa_bdd,
                eb.id_empresa,
                eb.empresa_bdd_descripcion,
                eb.empresa_bdd_host,
                eb.empresa_bdd_puerto,
                eb.empresa_bdd_usuario,

                licencia.id_licencia,
                licencia.estado AS estado_licencia,

                COALESCE(licencia_limite.usuarios_web_max::text, 'No definido') AS usuarios_web_max,
                COALESCE(licencia_limite.usuarios_app_max::text, 'No definido') AS usuarios_app_max,
                COALESCE(licencia_limite.relojes_max::text, 'No definido') AS relojes_max,
                COALESCE(licencia_limite.storage_mb_max::text, 'No definido') AS storage_mb_max,

                COALESCE(licencia_storage_uso.storage_mb_usado::text, 'No definido') AS storage_mb_usado,
                licencia_storage_uso.origen_calculo AS storage_origen_calculo,
                licencia_storage_uso.fecha_registro AS storage_fecha_registro,
                licencia_storage_uso.fecha_calculo AS storage_fecha_calculo,
                licencia_storage_uso.calculo_exitoso AS storage_calculo_exitoso,
                licencia_storage_uso.mensaje_error AS storage_mensaje_error,
                licencia_storage_uso.observacion AS storage_observacion,

                CASE 
                    WHEN pg_database.datname IS NOT NULL 
                        THEN 'LOCAL'
                    ELSE 'REMOTA'
                END AS tipo_base

            FROM public.empresa_bdd eb

            INNER JOIN public.empresa empresa
                ON empresa.empresa_id = eb.id_empresa

            LEFT JOIN public.licencia licencia
                ON licencia.id_empresa = empresa.empresa_id
               AND licencia.estado = 'ACTIVA'

            LEFT JOIN public.licencia_limite licencia_limite
                ON licencia_limite.id_licencia = licencia.id_licencia

            LEFT JOIN public.licencia_storage_uso licencia_storage_uso
                ON licencia_storage_uso.id_licencia = licencia.id_licencia

            LEFT JOIN pg_database 
                ON pg_database.datname = eb.empresa_bdd_nombre

            WHERE eb.empresa_bdd_nombre NOT IN (
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

            return res.jsonp(EMPRESAS.rows);

        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'error' });
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
        const id_empresa_bdd_ = req.body.id_empresa_bdd;
        const id_empresa_ = req.body.id_empresa;
        const empresa_bdd_nombre_ = req.body.empresa_bdd_nombre;
        const empresa_bdd_host_ = req.body.empresa_bdd_host;
        const empresa_bdd_puerto_ = req.body.empresa_bdd_puerto;
        const empresa_bdd_descripcion_ = req.body.empresa_bdd_descripcion;
        const empresa_bdd_usuario_ = req.body.empresa_bdd_usuario;
        const empresa_bdd_contrasena_ = req.body.empresa_bdd_contrasena;

        try {
            const actualizarContrasena = typeof empresa_bdd_contrasena_ === 'string'
                && empresa_bdd_contrasena_.trim() !== '';

            if (actualizarContrasena) {
                const contrasenaEncriptada = RsaKeyService.encriptarDatos(empresa_bdd_contrasena_);

                await pool.query(
                    `
                UPDATE empresa_bdd 
                SET 
                    id_empresa = $1, 
                    empresa_bdd_nombre = $2, 
                    empresa_bdd_host = $3, 
                    empresa_bdd_puerto = $4, 
                    empresa_bdd_descripcion = $5, 
                    empresa_bdd_usuario = $6, 
                    empresa_bdd_contrasena = $7, 
                    fecha_actualizacion = now()
                WHERE id_empresa_bdd = $8
                `,
                    [
                        id_empresa_,
                        empresa_bdd_nombre_,
                        empresa_bdd_host_,
                        empresa_bdd_puerto_,
                        empresa_bdd_descripcion_,
                        empresa_bdd_usuario_,
                        contrasenaEncriptada,
                        id_empresa_bdd_
                    ]
                );
            } else {
                await pool.query(
                    `
                UPDATE empresa_bdd 
                SET 
                    id_empresa = $1, 
                    empresa_bdd_nombre = $2, 
                    empresa_bdd_host = $3, 
                    empresa_bdd_puerto = $4, 
                    empresa_bdd_descripcion = $5, 
                    empresa_bdd_usuario = $6, 
                    fecha_actualizacion = now()
                WHERE id_empresa_bdd = $7
                `,
                    [
                        id_empresa_,
                        empresa_bdd_nombre_,
                        empresa_bdd_host_,
                        empresa_bdd_puerto_,
                        empresa_bdd_descripcion_,
                        empresa_bdd_usuario_,
                        id_empresa_bdd_
                    ]
                );
            }

            return res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error) {
            return res.jsonp({ message: error });
        }
    }


}

export const baseEmpresaControlador = new BaseEmpresaControlador;
export default baseEmpresaControlador;