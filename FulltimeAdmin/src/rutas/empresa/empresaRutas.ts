import { Router } from 'express';
import EMPRESA_CONTROLADOR from '../../controlador/empresa/empresaControlador';

class EmpresaRutas {

    public router: Router = Router();

    constructor(){
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/empresas', EMPRESA_CONTROLADOR.ObtenerEmpresas);
        this.router.post('/registro-empresa', EMPRESA_CONTROLADOR.RegistrarEmpresas);
        this.router.put('/actualizar-empresa', EMPRESA_CONTROLADOR.ActualizarEmpresa);
        this.router.post('/eliminar-empresa', EMPRESA_CONTROLADOR.EliminarEmpresa);
        this.router.get('/verEmpresa/:id', EMPRESA_CONTROLADOR.ListarEmpresaId);
    }
    
}

const EMPRESA_RUTAS = new EmpresaRutas();
export default EMPRESA_RUTAS.router;