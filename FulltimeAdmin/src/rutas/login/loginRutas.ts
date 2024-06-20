import { Router } from 'express';
import LOGIN_CONTROLADOR, { loginControlador } from '../../controlador/login/loginControlador';

class LoginRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/', LOGIN_CONTROLADOR.ObtenerDatosBaseInicial);
    }
}

const LOGIN_RUTAS = new LoginRutas();
export default LOGIN_RUTAS.router;