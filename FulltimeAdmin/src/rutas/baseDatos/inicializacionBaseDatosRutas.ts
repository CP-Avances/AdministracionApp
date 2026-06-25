import { Router } from 'express';
import INICIALIZACION_BASE_DATOS_CONTROLADOR from '../../controlador/baseDatos/inicializacionBaseDatosControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { UploadScriptsBd } from '../../middleware/uploadScriptsBd';

class InicializacionBaseDatosRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.post(
            '/crear-base',
            TokenValidation,
            (req, res) => INICIALIZACION_BASE_DATOS_CONTROLADOR.CrearBaseDatos(req, res)
        );

        this.router.post(
            '/ejecutar-scripts',
            TokenValidation,
            UploadScriptsBd.fields([
                { name: 'script_tablas', maxCount: 1 },
                { name: 'script_vistas', maxCount: 1 },
                { name: 'script_datos_iniciales', maxCount: 1 }
            ]),
            (req, res) => INICIALIZACION_BASE_DATOS_CONTROLADOR.EjecutarScriptsInicializacion(req, res)
        );

        this.router.get(
            '/historial/:id_empresa',
            TokenValidation,
            (req, res) => INICIALIZACION_BASE_DATOS_CONTROLADOR.ObtenerHistorialInicializacion(req, res)
        );
    }

}

const INICIALIZACION_BASE_DATOS_RUTAS = new InicializacionBaseDatosRutas();
export default INICIALIZACION_BASE_DATOS_RUTAS.router;