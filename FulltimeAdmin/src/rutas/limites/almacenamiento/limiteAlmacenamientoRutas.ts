import { Router } from 'express';
import LIMITE_ALMACENAMIENTO_CONTROLADOR from '../../../controlador/limites/almacenamiento/limiteAlmacenamientoControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { AutotaskApiKey } from '../../../middleware/middlewareAutoTask';

class LimiteAlmacenamientoRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.put('/guardar', TokenValidation, LIMITE_ALMACENAMIENTO_CONTROLADOR.GuardarLicenciaStorageUso);

        this.router.get('/activa/:id_empresa', TokenValidation, LIMITE_ALMACENAMIENTO_CONTROLADOR.ObtenerStorageLicenciaActiva);

        this.router.get('/todos/:id_empresa', TokenValidation, LIMITE_ALMACENAMIENTO_CONTROLADOR.ObtenerTodosStorageLicencia);

        this.router.post(
            '/calcular-storage-empresa',
            TokenValidation,
            (req, res) => LIMITE_ALMACENAMIENTO_CONTROLADOR.CalcularStorageEmpresa(req, res)
        );

        // SERVICIOS UTILIZADOS EN SERVIDOR AUTOTASK
        this.router.get(
            '/autotask/storage/empresas-internas',
            AutotaskApiKey,
            (req, res) => LIMITE_ALMACENAMIENTO_CONTROLADOR.ObtenerEmpresasInternasStorage(req, res)
        );

        this.router.put(
            '/autotask/storage/guardar',
            AutotaskApiKey,
            (req, res) => LIMITE_ALMACENAMIENTO_CONTROLADOR.GuardarLicenciaStorageUso(req, res)
        );
    }

}

const LIMITE_ALMACENAMIENTO_RUTAS = new LimiteAlmacenamientoRutas();
export default LIMITE_ALMACENAMIENTO_RUTAS.router;