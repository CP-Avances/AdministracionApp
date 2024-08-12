import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';
import RsaKeyService, { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class EmpresaControlador {

    public async ObtenerEmpresas(req: Request, res: Response){
        try{
            const EMPRESAS = await pool.query(
                `
                SELECT empresa_id, empresa_codigo, empresa_direccion, empresa_descripcion, hora_extra, accion_personal, alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, movil_direccion, movil_descripcion FROM empresa ORDER BY 1
                `
            );
            
            if (EMPRESAS.rowCount !== null) {
                if(EMPRESAS.rowCount > 0){
                    for (const empresa of EMPRESAS.rows) {
                        empresa.empresa_codigo = FUNCIONES_LLAVES.desencriptarLogin(empresa.empresa_codigo);
                    }
                    return res.jsonp(EMPRESAS.rows);
                }else{
                    res.status(404).jsonp({ message: 'vacio' });
                }
            }else{
                res.status(500).jsonp({ message: 'error' });
            }
        }
        catch(error)
        {
            res.status(500).jsonp({ message: 'error' });
        }
    }

    public async RegistrarEmpresas(req: Request, res: Response) {
        let empresa_codigo_ = req.body.empresa_codigo;
        let empresa_direccion_ = req.body.empresa_direccion;
        let empresa_descripcion_ = req.body.empresa_descripcion;
        let hora_extra_ = req.body.hora_extra;
        let accion_personal_ = req.body.accion_personal;
        let alimentacion_ = req.body.alimentacion;
        let permisos_ = req.body.permisos;
        let geolocalizacion_ = req.body.geolocalizacion;
        let vacaciones_ = req.body.vacaciones;
        let app_movil_ = req.body.app_movil;
        let timbre_web_ = req.body.timbre_web;
        let movil_direccion_ = req.body.movil_direccion;
        let movil_descripcion_ = req.body.movil_descripcion;

        try {
            let codigo_empresa_mod = RsaKeyService.encriptarLogin(empresa_codigo_);

            const response: QueryResult = await pool.query(
                `
                INSERT INTO empresa (empresa_codigo, empresa_direccion, empresa_descripcion, hora_extra, accion_personal, alimentacion, permisos, geolocalizacion, vacaciones, app_movil, timbre_web, movil_direccion, movil_descripcion)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
                `,
                [codigo_empresa_mod, empresa_direccion_, empresa_descripcion_, hora_extra_, accion_personal_, alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_, movil_direccion_, movil_descripcion_]
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

    public async ActualizarEmpresa(req: Request, res: Response) {
        let empresa_id_ = req.body.empresa_id;
        let empresa_codigo_ = req.body.empresa_codigo;
        let empresa_direccion_ = req.body.empresa_direccion;
        let empresa_descripcion_ = req.body.empresa_descripcion;
        let hora_extra_ = req.body.hora_extra;
        let accion_personal_ = req.body.accion_personal;
        let alimentacion_ = req.body.alimentacion;
        let permisos_ = req.body.permisos;
        let geolocalizacion_ = req.body.geolocalizacion;
        let vacaciones_ = req.body.vacaciones;
        let app_movil_ = req.body.app_movil;
        let timbre_web_ = req.body.timbre_web;
        let movil_direccion_ = req.body.movil_direccion;
        let movil_descripcion_ = req.body.movil_descripcion;

        try{
            let empresa_codigo_mod = RsaKeyService.encriptarLogin(empresa_codigo_);

            await pool.query(
                `
                UPDATE empresa SET empresa_codigo = $2, empresa_direccion = $3, empresa_descripcion = $4, hora_extra = $5, accion_personal = $6, alimentacion = $7, permisos = $8, geolocalizacion = $9, vacaciones = $10, app_movil = $11, timbre_web = $12, movil_direccion = $13, movil_descripcion = $14 
                WHERE empresa_id = $1
                `,
                [empresa_id_, empresa_codigo_mod, empresa_direccion_, empresa_descripcion_, hora_extra_, accion_personal_, alimentacion_, permisos_, geolocalizacion_, vacaciones_, app_movil_, timbre_web_, movil_direccion_, movil_descripcion_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error)
        {
            return res.jsonp({ message: error });
        }
    }

    public async ActualizarEmpresaFormUno(req: Request, res: Response) {
        let empresa_id_ = req.body.empresa_id;
        let empresa_codigo_ = req.body.empresa_codigo;
        let empresa_direccion_ = req.body.empresa_direccion;
        let empresa_descripcion_ = req.body.empresa_descripcion;

        try{
            let empresa_codigo_mod = RsaKeyService.encriptarLogin(empresa_codigo_);

            await pool.query(
                `
                UPDATE empresa SET empresa_codigo = $2, empresa_direccion = $3, empresa_descripcion = $4 
                WHERE empresa_id = $1
                `,
                [empresa_id_, empresa_codigo_mod, empresa_direccion_, empresa_descripcion_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error)
        {
            return res.jsonp({ message: error });
        }
    }

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

    public async ListarEmpresaId(req: Request, res: Response){
        const { id } = req.params;
        const EMPRESA = await pool.query(
            `
            SELECT * FROM empresa WHERE empresa_id = $1
            `
            , [id]);
        if (EMPRESA.rowCount != 0) {
            for (const empresa of EMPRESA.rows) {
                empresa.empresa_codigo = FUNCIONES_LLAVES.desencriptarLogin(empresa.empresa_codigo);
            }
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros.' });
        }
    }

    public async ActualizarEmpresaModulos(req: Request, res: Response) {
        let empresa_id_ = req.body.empresa_id;
        let empresa_modulos_permisos_ = req.body.empresa_modulos_permisos_;
        let empresa_modulos_vacaciones_ = req.body.empresa_modulos_vacaciones_;
        let empresa_modulos_hora_extra_ = req.body.empresa_modulos_hora_extra_;
        let empresa_modulos_geolocalizacion_ = req.body.empresa_modulos_geolocalizacion_;
        let empresa_modulos_timbre_web_ = req.body.empresa_modulos_timbre_web_;
        let empresa_modulos_app_movil_ = req.body.empresa_modulos_app_movil_;
        let empresa_modulos_accion_personal_ = req.body.empresa_modulos_accion_personal_;
        let empresa_modulos_alimentacion_ = req.body.empresa_modulos_alimentacion_;

        try{
            await pool.query(
                `
                UPDATE empresa SET hora_extra = $2, accion_personal = $3, alimentacion = $4, permisos = $5, geolocalizacion = $6, vacaciones = $7, app_movil = $8, timbre_web = $9 
                WHERE empresa_id = $1
                `,
                [empresa_id_, empresa_modulos_hora_extra_, empresa_modulos_accion_personal_, empresa_modulos_alimentacion_, empresa_modulos_permisos_, empresa_modulos_geolocalizacion_, empresa_modulos_vacaciones_, empresa_modulos_app_movil_, empresa_modulos_timbre_web_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error)
        {
            return res.jsonp({ message: error });
        }
    }

}

export const empresaControlador = new EmpresaControlador;
export default empresaControlador;