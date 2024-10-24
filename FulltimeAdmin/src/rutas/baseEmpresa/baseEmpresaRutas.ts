import { Router } from 'express';
import BASE_EMPRESA_CONTROLADOR from '../../controlador/baseEmpresa/baseEmpresaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class BaseEmpresaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/registro-base-empresas', TokenValidation,  BASE_EMPRESA_CONTROLADOR.RegistrarEmpresas);
        this.router.get('/base-empresas-informacion', TokenValidation,  BASE_EMPRESA_CONTROLADOR.ObtenerBaseEmpresasInformacion);
        this.router.get('/base-empresas', TokenValidation,  BASE_EMPRESA_CONTROLADOR.ObtenerBaseEmpresas);
        this.router.post('/buscar-empresas', TokenValidation,  BASE_EMPRESA_CONTROLADOR.BuscarBaseEmpresas);
        this.router.get('/buscar-empresas/:id', TokenValidation,  BASE_EMPRESA_CONTROLADOR.BuscarBaseEmpresasPorId);
        this.router.put('/actualizar-empresas', TokenValidation,  BASE_EMPRESA_CONTROLADOR.ActualizarBaseEmpresa);
        this.router.post('/eliminar-empresas', TokenValidation,  BASE_EMPRESA_CONTROLADOR.EliminarEmpresa);
    }
    
}

const BASE_EMPRESA_RUTAS = new BaseEmpresaRutas();
export default BASE_EMPRESA_RUTAS.router;