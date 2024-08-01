import { Request, Response } from 'express';
import {pool, dbConfig} from '../../database';

class BaseInicialControlador {

    public async ObtenerDatosBaseInicial(req: Request, res: Response){
        try{
            let datos_base = 
            { 
                base: dbConfig.database,
                host: dbConfig.host,
                puerto: dbConfig.port,
                usuario: dbConfig.user
            }

            res.status(200).jsonp(
                datos_base
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