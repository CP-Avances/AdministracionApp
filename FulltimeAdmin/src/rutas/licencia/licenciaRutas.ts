import { Router } from 'express';
import LICENCIA_CONTROLADOR from '../../controlador/licencia/licenciaControlador';

class LicenciaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/registro-licencia', LICENCIA_CONTROLADOR.RegistrarLicencia);
        this.router.get('/licencias', LICENCIA_CONTROLADOR.ObtenerLicencias);
        this.router.get('/licencias-empresas', LICENCIA_CONTROLADOR.ObtenerLicenciasEmpresas);
        this.router.put('/actualizar-licencia', LICENCIA_CONTROLADOR.ActualizarLicencia);
        this.router.post('/eliminar-licencia', LICENCIA_CONTROLADOR.EliminarLicencia);
    }
    
}

const LICENCIA_RUTAS = new LicenciaRutas();
export default LICENCIA_RUTAS.router;