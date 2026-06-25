import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';

class EmpresaControlador {

    // MEJORAS IMPLEMENTADAS EN BASE DE DATOS

    // REGISTRAR DATOS DE EMPRESA
    public async RegistrarDatosEmpresa(req: Request, res: Response) {
        let empresa_codigo_ = req.body.empresa_codigo;
        let empresa_descripcion_ = req.body.empresa_descripcion;
        let instalacion_ = req.body.instalacion;
        let zona_horaria_ = req.body.zona_horaria;
        try {
            const response: QueryResult = await pool.query(
                `
                INSERT INTO empresa (empresa_codigo, empresa_descripcion, zona_horaria, instalacion)
                     VALUES ($1, $2, $3, $4) RETURNING *
                `,
                [empresa_codigo_, empresa_descripcion_, zona_horaria_, instalacion_]
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


    // METODO PARA ACTUALIZAR EMPRESA
    public async ActualizarDatosEmpresa(req: Request, res: Response) {
        let empresa_id_ = req.body.empresa_id;
        let empresa_codigo_ = req.body.empresa_codigo;
        let empresa_descripcion_ = req.body.empresa_descripcion;
        let empresa_estado_ = req.body.estado;
        let empresa_zona_horaria_ = req.body.zona_horaria;
        let empresa_instalacion_ = req.body.instalacion;
        try {

            await pool.query(
                `
                UPDATE empresa SET empresa_codigo = $2, empresa_descripcion = $3, 
                estado = $4, zona_horaria = $5, instalacion = $6, fecha_actualizacion = now()
                WHERE empresa_id = $1
                `,
                [empresa_id_, empresa_codigo_, empresa_descripcion_, empresa_estado_, empresa_zona_horaria_, empresa_instalacion_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error) {
            return res.jsonp({ message: error });
        }
    }

    // METODO PARA ELIMINAR EMPRESAS
    public async EliminarEmpresa(req: Request, res: Response) {
        try {
            let empresa_id_ = req.body.empresa_id;

            await pool.query(
                `
                DELETE FROM empresa WHERE empresa_id = $1
                `
                , [empresa_id_]
            );

            res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }


    // METODO PARA LISTAR DATOS DE EMPRESA
    public async ListarEmpresaId(req: Request, res: Response) {
        const { id } = req.params;
        const EMPRESA = await pool.query(
            `
            SELECT * FROM empresa WHERE empresa_id = $1
            `
            , [id]);
        if (EMPRESA.rowCount != 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    // METODO PARA LISTAR DATOS DE EMPRESA
    public async ObtenerEmpresas(req: Request, res: Response) {
        try {
            const EMPRESAS = await pool.query(
                `
                SELECT 
                empresa_id, empresa_codigo, empresa_descripcion, estado, instalacion 
                FROM empresa ORDER BY estado DESC
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

    // METODO PARA OBTENER ZONAS HORARIAS
    public async ObtenerZonasHorarias(req: Request, res: Response) {
        try {
            const ZONAS = await pool.query(
                `
                SELECT * FROM zonas_horarias ORDER BY nombre_general ASC
                `
            );

            if (ZONAS.rowCount !== null) {
                if (ZONAS.rowCount > 0) {
                    return res.jsonp(ZONAS.rows);
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


}

export const empresaControlador = new EmpresaControlador;
export default empresaControlador;