import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';
import * as CryptoJS from 'crypto-js';
import RsaKeyService, { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class LicenciaControlador {
    
    public async RegistrarLicencia(req: Request, res: Response) {
        let id_empresa_bdd_ = req.body.id_empresa_bdd;
        let empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
        let empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;

        const licencia_datos = {
            id_empresa_bdd: id_empresa_bdd_,
            fecha_activacion: empresa_licencia_fecha_activacion_,
            fecha_desactivacion: empresa_licencia_fecha_desactivacion_
        }

        try {
            const jsonEncriptado = FUNCIONES_LLAVES.encriptarLogin(JSON.stringify(licencia_datos).toString());

            if(jsonEncriptado === null){
                return res.status(500).jsonp({ message: 'error' });
            }

            const response: QueryResult = await pool.query(
                `
                INSERT INTO empresa_licencia (id_empresa_bdd, llave_publica, fecha_activacion, fecha_desactivacion)
                    VALUES ($1, $2, $3, $4) RETURNING *
                `,
                [licencia_datos.id_empresa_bdd, jsonEncriptado, licencia_datos.fecha_activacion, licencia_datos.fecha_desactivacion]
            );

            const [registro_licencia] = response.rows;
            console.log('reg_', registro_licencia);

            if (registro_licencia) {
                return res.status(200).jsonp({ message: 'ok' });
            } else {
                return res.status(404).jsonp({ message: 'error' });
            }
            
        } catch (error) {
            return res.status(500).jsonp({ message: error });
        }
    }

    public async ObtenerLicencias(req: Request, res: Response){
        try{
            const LICENCIAS = await pool.query(
                `
                SELECT 
                    empresa_licencia.id_empresa_licencia, 
                    empresa_licencia.id_empresa_bdd, 
                    empresa_licencia.llave_publica, 
                    empresa_licencia.fecha_activacion, 
                    empresa_licencia.fecha_desactivacion
                FROM empresa_licencia empresa_licencia 
                ORDER BY 1 
                `
            );
            
            if (LICENCIAS.rowCount !== null) {
                if(LICENCIAS.rowCount > 0){
                    return res.jsonp(LICENCIAS.rows);
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

    public async ObtenerLicenciasEmpresas(req: Request, res: Response){
        try{
            const LICENCIAS = await pool.query(
                `
                SELECT 
                    empresa_licencia.id_empresa_licencia,
                    empresa_licencia.id_empresa_bdd,
                    empresa_bdd.empresa_bdd_nombre,
                    empresa.empresa_descripcion,
                    empresa_licencia.llave_publica,
                    empresa_licencia.fecha_activacion,
                    empresa_licencia.fecha_desactivacion 
                FROM empresa_licencia empresa_licencia 
                INNER JOIN empresa_bdd empresa_bdd ON empresa_bdd.id_empresa_bdd = empresa_licencia.id_empresa_bdd
                INNER JOIN empresa empresa ON empresa.empresa_id = empresa_bdd.id_empresa
                ORDER BY empresa_bdd.id_empresa;
                `
            );
            
            if (LICENCIAS.rowCount !== null) {
                if(LICENCIAS.rowCount > 0){
                    return res.jsonp(LICENCIAS.rows);
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

    public async ActualizarLicencia(req: Request, res: Response) {
        let id_empresa_licencia_ = req.body.id_empresa_licencia;
        let id_empresa_bdd_ = req.body.id_empresa_bdd;
        let empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
        let empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;

        try{

            const licencia_datos = {
                id_empresa_bdd: id_empresa_bdd_,
                fecha_activacion: empresa_licencia_fecha_activacion_,
                fecha_desactivacion: empresa_licencia_fecha_desactivacion_
            }

            const jsonEncriptado = FUNCIONES_LLAVES.encriptarLogin(JSON.stringify(licencia_datos).toString());

            await pool.query(
                `
                UPDATE empresa_licencia SET id_empresa_bdd = $2, llave_publica = $3, fecha_activacion = $4, fecha_desactivacion = $5 
                WHERE id_empresa_licencia = $1 
                `,
                [id_empresa_licencia_, id_empresa_bdd_, jsonEncriptado, empresa_licencia_fecha_activacion_, empresa_licencia_fecha_desactivacion_]
            );

            res.jsonp({ message: 'Registro actualizado.' });
        }
        catch (error)
        {
            return res.jsonp({ message: error });
        }
    }

    public async EliminarLicencia(req: Request, res: Response) {
        try {
            let id_empresa_licencia_ = req.body.id_empresa_licencia;
            
            await pool.query(
                `
                DELETE FROM empresa_licencia WHERE id_empresa_licencia = $1
                `
                , [id_empresa_licencia_]
            );

            res.jsonp({ message: 'Registro eliminado.' });
        } catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    public async BuscarLicenciaPorId(req: Request, res: Response){
        try{
            const { id } = req.params;

            const LICENCIAS = await pool.query(
                `
                SELECT 
                    empresa_licencia.id_empresa_licencia,
                    empresa_licencia.id_empresa_bdd,
                    empresa_licencia.llave_publica,
                    empresa_licencia.fecha_activacion,
                    empresa_licencia.fecha_desactivacion
                FROM empresa_licencia empresa_licencia
                INNER JOIN empresa_bdd empresa_bdd ON empresa_bdd.id_empresa_bdd = empresa_licencia.id_empresa_bdd
                WHERE 
                    empresa_bdd.id_empresa = $1
                ORDER BY 1
                `,
                [id]
            );
            
            if (LICENCIAS.rowCount !== null) {
                if(LICENCIAS.rowCount > 0){
                    res.jsonp(LICENCIAS.rows);
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

}

export const licenciaControlador = new LicenciaControlador;
export default licenciaControlador;