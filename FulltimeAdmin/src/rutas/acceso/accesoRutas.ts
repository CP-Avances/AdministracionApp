import { Router } from 'express';
import ACCESO_CONTROLADOR from '../../controlador/acceso/accesoControlador';

class AccesoRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/actualizar-accessweb', ACCESO_CONTROLADOR.ActualizarAccesoWeb);
    }
    
}

const ACCESO_RUTAS = new AccesoRutas();
export default ACCESO_RUTAS.router;