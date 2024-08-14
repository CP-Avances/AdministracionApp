import { Router } from 'express';
import BASEINICIAL_CONTROLADOR from '../../controlador/baseInicial/baseInicialControlador';
import { TokenValidation } from '../../libs/verificarToken';

class BaseInicialRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/base-informacion', TokenValidation, BASEINICIAL_CONTROLADOR.ObtenerDatosBaseInicial);
    }
}

const BASEINICIAL_RUTAS = new BaseInicialRutas();
export default BASEINICIAL_RUTAS.router;