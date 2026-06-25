import { Router } from 'express';
import LICENCIA_CONTROLADOR from '../../controlador/licencia/licenciaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class LicenciaRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/registro-licencia', TokenValidation, (req, res) =>
            LICENCIA_CONTROLADOR.RegistrarLicencia(req, res)
        );

        this.router.get('/licencias-empresas/:id', TokenValidation, (req, res) =>
            LICENCIA_CONTROLADOR.BuscarLicenciaPorId(req, res)
        );

        this.router.put('/actualizar-licencia', TokenValidation, (req, res) =>
            LICENCIA_CONTROLADOR.ActualizarLicencia(req, res)
        );
    }

}

const LICENCIA_RUTAS = new LicenciaRutas();
export default LICENCIA_RUTAS.router;