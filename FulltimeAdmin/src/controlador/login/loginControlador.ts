import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

class LoginControlador {

    public async ObtenerDatosBaseInicial(req: Request, res: Response){
        try{
            const { usuario, contrasena } = req.body;

            //OBTENCION DE DIRECCION IP
            
            var requestIp = require('request-ip');
            var clientIp = requestIp.getClientIp(req);
            
            if (clientIp != null && clientIp != '' && clientIp != undefined) {
                var ip_cliente = clientIp.split(':')[3];
            }
            
            let fechaHoy = new Date();

            if(usuario === 'admin' && contrasena === 'adminFulltime'){
                const token = jwt.sign({
                    _usuario: usuario, _ip_adress: ip_cliente, _fecha: fechaHoy
                }, 
                    process.env.TOKEN_SECRET || 'llaveSecreta',
                { 
                    expiresIn: 60 * 60 * 23, algorithm: 'HS512'
                }
                );
                return res.status(200).jsonp({mensaje: 'ok', token, ip_adress: ip_cliente});
            }
            else
            {
                res.status(500).jsonp({ message: 'Credenciales Erroneas' });
            }
        }
        catch(error)
        {
            console.error(error);
            res.status(500).jsonp({ message: 'error' });
        }
    }

}

export const loginControlador = new LoginControlador;
export default loginControlador;