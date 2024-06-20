import express, { Application } from 'express';
import cors from 'cors';

import { createServer, Server } from 'http';
import LOGIN_RUTAS from './rutas/login/loginRutas';
import BASEINICIAL_RUTAS from './rutas/baseInicial/baseInicialRutas';
import BASE_EMPRESAS_RUTAS from './rutas/baseEmpresa/baseEmpresaRutas';
import EMPRESA_RUTAS from './rutas/empresa/empresaRutas';
import LICENCIA_RUTAS from './rutas/licencia/licenciaRutas';
import ACCESO_RUTAS from './rutas/acceso/accesoRutas';

var io: any;

class Servidor{
    public app: Application;
    public server: Server;

    constructor(){
        this.app = express();
        this.configuracion();
        this.rutas();

        this.server = createServer(this.app);
        this.app.use(cors());
    }

    configuracion(): void {
        this.app.set('puerto', process.env.PORT || 3008);
        this.app.use(cors());
        
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }

    rutas(): void {
        //this.app.use('/fulltime', EMPRESAS_RUTAS);//ruta para empresa
        //this.app.use('/parametrizacion', PARAMETRIZACION_RUTAS);//ruta datos inciales
        //this.app.use('/empleado', EMPLEADO_RUTAS);//ruta datos inciales
        this.app.use('/base-empresa', BASE_EMPRESAS_RUTAS);
        this.app.use('/login', LOGIN_RUTAS);
        this.app.use('/base', BASEINICIAL_RUTAS);
        this.app.use('/empresa', EMPRESA_RUTAS);
        this.app.use('/licencia', LICENCIA_RUTAS);
        this.app.use('/web-access', ACCESO_RUTAS);
    }

    start(): void {
        this.server.listen(this.app.get('puerto'), () => {
            console.log('Servidor en el puerto', this.app.get('puerto'));
        });
        
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            next();
        });
    }
}

const SERVIDOR = new Servidor();
SERVIDOR.start();