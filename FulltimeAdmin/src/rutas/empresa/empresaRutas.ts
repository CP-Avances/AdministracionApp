import { Router } from 'express';
import EMPRESA_CONTROLADOR from '../../controlador/empresa/empresaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class EmpresaRutas {

    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        this.router.post('/registro-empresa', TokenValidation, EMPRESA_CONTROLADOR.RegistrarDatosEmpresa);

        this.router.put('/actualizar-empresa-form-uno', TokenValidation, EMPRESA_CONTROLADOR.ActualizarDatosEmpresa);

        this.router.post('/eliminar-empresa', TokenValidation, EMPRESA_CONTROLADOR.EliminarEmpresa);

        this.router.get('/zonas-horarias', TokenValidation, EMPRESA_CONTROLADOR.ObtenerZonasHorarias);

        this.router.get('/verEmpresa/:id', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresaId);

        this.router.get('/empresas', TokenValidation, EMPRESA_CONTROLADOR.ObtenerEmpresas);

    }

}

const EMPRESA_RUTAS = new EmpresaRutas();
export default EMPRESA_RUTAS.router;