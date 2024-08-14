import { Router } from 'express';
import LICENCIA_CONTROLADOR from '../../controlador/licencia/licenciaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class LicenciaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/registro-licencia', TokenValidation, LICENCIA_CONTROLADOR.RegistrarLicencia);
        this.router.get('/licencias', TokenValidation, LICENCIA_CONTROLADOR.ObtenerLicencias);
        this.router.get('/licencias-empresas', TokenValidation, LICENCIA_CONTROLADOR.ObtenerLicenciasEmpresas);
        this.router.get('/licencias-empresas/:id', TokenValidation, LICENCIA_CONTROLADOR.BuscarLicenciaPorId);
        this.router.put('/actualizar-licencia', TokenValidation, LICENCIA_CONTROLADOR.ActualizarLicencia);
        this.router.post('/eliminar-licencia', TokenValidation, LICENCIA_CONTROLADOR.EliminarLicencia);
    }
    
}

const LICENCIA_RUTAS = new LicenciaRutas();
export default LICENCIA_RUTAS.router;