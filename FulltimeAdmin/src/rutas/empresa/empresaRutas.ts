import { Router } from 'express';
import EMPRESA_CONTROLADOR from '../../controlador/empresa/empresaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class EmpresaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/empresas', TokenValidation, EMPRESA_CONTROLADOR.ObtenerEmpresas);
        this.router.post('/registro-empresa', TokenValidation, EMPRESA_CONTROLADOR.RegistrarEmpresas);
        this.router.put('/actualizar-empresa', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresa);
        this.router.put('/actualizar-empresa-form-uno', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresaFormUno);
        this.router.post('/eliminar-empresa', TokenValidation, EMPRESA_CONTROLADOR.EliminarEmpresa);
        this.router.get('/verEmpresa/:id', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresaId);
        this.router.put('/actualizar-empresa-modulos', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresaModulos);
    }
    
}

const EMPRESA_RUTAS = new EmpresaRutas();
export default EMPRESA_RUTAS.router;