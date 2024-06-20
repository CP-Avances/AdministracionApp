import { Router } from 'express';
import BASEINICIAL_CONTROLADOR from '../../controlador/baseInicial/baseInicialControlador';

class BaseInicialRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/base-informacion', BASEINICIAL_CONTROLADOR.ObtenerDatosBaseInicial);
    }
}

const BASEINICIAL_RUTAS = new BaseInicialRutas();
export default BASEINICIAL_RUTAS.router;