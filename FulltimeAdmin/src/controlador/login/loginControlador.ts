import { Request, Response } from 'express';

class LoginControlador {

    public async ObtenerDatosBaseInicial(req: Request, res: Response){
        try{
            const { usuario, contrasena } = req.body;

            if(usuario === 'admin' && contrasena === 'adminFulltime'){
                return res.status(200).jsonp({mensaje: 'ok'});
            }
            else
            {
                res.status(500).jsonp({ message: 'Credenciales Erroneas' });
            }
        }
        catch(error)
        {
            res.status(500).jsonp({ message: 'error' });
        }
    }

}

export const loginControlador = new LoginControlador;
export default loginControlador;