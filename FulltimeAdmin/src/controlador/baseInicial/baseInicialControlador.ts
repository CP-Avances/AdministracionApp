import { Request, Response } from 'express';
import {pool, dbConfig} from '../../database';

class BaseInicialControlador {

    public async ObtenerDatosBaseInicial(req: Request, res: Response){
        try{
            res.status(200).jsonp(
                { 
                    base: dbConfig.database,
                    host: dbConfig.host,
                    puerto: dbConfig.port,
                    usuario: dbConfig.user
                }
            );
        }
        catch(error)
        {
            res.status(500).jsonp({ message: 'error' });
        }
    }

}

export const baseInicialControlador = new BaseInicialControlador;
export default baseInicialControlador;