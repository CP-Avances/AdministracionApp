import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import pool from '../database';

interface IPayload {
    _id: number,
    _id_empleado: number,
    rol: number,
    _dep: number,
    _suc: number,
    _empresa: number,
    cargo: number,
    estado: boolean,
    codigo: number | string,
    _licencia: string,
    _web_access: boolean,
    _acc_tim: boolean,
    _usuario: string
}

export const TokenValidation = async (req: Request, res: Response, next: NextFunction) => {
    
    // VERIFICA SI EN LA PETICION EXISTE LA CABECERA AUTORIZACION 
    if (!req.headers.authorization) {
        return res.status(401).send('No puede solicitar, permiso denegado.');
    }
    // SI EXISTE PASA A LA SIGUIENTE VALIDACION
    // VERIFICACION SI EL TOKEN ESTA VACIO
    const token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('No contienen token de autenticación.');
    }

    try {
        // SI EL TOKEN NO ESTA VACIO
        // SE EXTRAE LOS DATOS DEL TOKEN 
        const payload = jwt.verify(token, process.env.TOKEN_SECRET || 'llaveSecreta') as IPayload;
        // CUANDO SE EXTRAE LOS DATOS SE GUARDA EN UNA PROPIEDAD REQ.USERID PARA Q LAS DEMAS FUNCIONES PUEDAN UTILIZAR ESE ID 
        if (!payload._usuario) return res.status(401).send('No tiene acceso a los recursos de la aplicacion.');
        
        const hoy = new Date();

        if (payload !== undefined) {
            if(payload._usuario === 'admin'){
                next();
            }
        } else {
            return res.status(401).send('Ups!!! No tiene acceso al recurso solicitado.');
        }
        
    } catch (error) {
        return res.status(401).send(error.message);
    }
    
}