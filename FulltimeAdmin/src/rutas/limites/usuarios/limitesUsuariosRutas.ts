import { Router } from 'express';
import LIMITE_USUARIOS_CONTROLADOR from '../../../controlador/limites/usuarios/limitesUsuariosControlador';
import { TokenValidation } from '../../../libs/verificarToken';

class LimiteUsuariosRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.post('/registrar', TokenValidation, (req, res) =>
            LIMITE_USUARIOS_CONTROLADOR.RegistrarLicenciaLimite(req, res)
        );

        this.router.put('/actualizar', TokenValidation, (req, res) =>
            LIMITE_USUARIOS_CONTROLADOR.ActualizarLicenciaLimite(req, res)
        );

        this.router.get('/limites-activos/:id_empresa', TokenValidation, (req, res) =>
            LIMITE_USUARIOS_CONTROLADOR.ObtenerLimiteLicenciaActiva(req, res)
        );

        this.router.get('/limites-totales/:id_empresa', TokenValidation, (req, res) =>
            LIMITE_USUARIOS_CONTROLADOR.ObtenerTodosLimitesLicencia(req, res)
        );

    }

}

const LIMITE_USUARIOS_RUTAS = new LimiteUsuariosRutas();
export default LIMITE_USUARIOS_RUTAS.router;