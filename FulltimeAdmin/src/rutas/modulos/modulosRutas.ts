import { Router } from 'express';
import MODULOS_CONTROLADOR from '../../controlador/modulos/modulosControlador';
import { TokenValidation } from '../../libs/verificarToken';

class ModulosRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.get('/buscar-modulos', TokenValidation, (req, res) =>
            MODULOS_CONTROLADOR.ObtenerModulos(req, res)
        );

        this.router.get('/modulos-activos/:id_empresa', TokenValidation, (req, res) =>
            MODULOS_CONTROLADOR.ObtenerModulosActivos(req, res)
        );

        this.router.put('/licencia-modulos/guardar', TokenValidation, (req, res) =>
            MODULOS_CONTROLADOR.GuardarLicenciaModulos(req, res)
        );

        this.router.get('/modulos-licencia/:id_empresa', TokenValidation, (req, res) =>
            MODULOS_CONTROLADOR.ObtenerTodosModulosLicencia(req, res)
        );

    }

}

const MODULOS_RUTAS = new ModulosRutas();
export default MODULOS_RUTAS.router;