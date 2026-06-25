import { Router } from 'express';
import LICENCIA_MOVIMIENTOS_CONTROLADOR from '../../controlador/historial/licenciaMovimientoControlador';
import { TokenValidation } from '../../libs/verificarToken';

class LicenciaMovimientosRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.get('/:id_empresa', TokenValidation, LICENCIA_MOVIMIENTOS_CONTROLADOR.ObtenerMovimientosLicencia);

    }

}

const LICENCIA_MOVIMIENTOS_RUTAS = new LicenciaMovimientosRutas();
export default LICENCIA_MOVIMIENTOS_RUTAS.router;