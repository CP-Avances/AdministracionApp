require('dotenv').config();
import express, { Application } from 'express';
import cors from 'cors';

import { createServer, Server } from 'http';
import LOGIN_RUTAS from './rutas/login/loginRutas';
import BASEINICIAL_RUTAS from './rutas/baseInicial/baseInicialRutas';
import BASE_EMPRESAS_RUTAS from './rutas/baseEmpresa/baseEmpresaRutas';
import EMPRESA_RUTAS from './rutas/empresa/empresaRutas';
import LICENCIA_RUTAS from './rutas/licencia/licenciaRutas';
import ACCESO_RUTAS from './rutas/acceso/accesoRutas';
import MODULOS_RUTAS from './rutas/modulos/modulosRutas';
import LIMITE_USUARIOS_RUTAS from './rutas/limites/usuarios/limitesUsuariosRutas';
import LIMITE_ALMACENAMIENTO_RUTAS from './rutas/limites/almacenamiento/limiteAlmacenamientoRutas';
import LICENCIA_MOVIMIENTOS_RUTAS from './rutas/historial/licenciaMovimientoRutas';
import INICIALIZACION_BASE_DATOS_RUTAS from './rutas/baseDatos/inicializacionBaseDatosRutas';

var io: any;

class Servidor {
    public app: Application;
    public server: Server;

    constructor() {
        this.app = express();
        this.configuracion();
        this.rutas();

        this.server = createServer(this.app);
        this.app.use(cors());
    }

    configuracion(): void {
        this.app.set('puerto', process.env.PORT || 3020);
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
        this.app.use('/base-empresa', BASE_EMPRESAS_RUTAS);
        this.app.use('/login', LOGIN_RUTAS);
        this.app.use('/base', BASEINICIAL_RUTAS);
        this.app.use('/empresa', EMPRESA_RUTAS);
        this.app.use('/licencia', LICENCIA_RUTAS);
        this.app.use('/web-access', ACCESO_RUTAS);
        this.app.use('/modulos', MODULOS_RUTAS);
        this.app.use('/limite-usuarios', LIMITE_USUARIOS_RUTAS);
        this.app.use('/storage-uso', LIMITE_ALMACENAMIENTO_RUTAS);
        this.app.use('/licencia-movimientos', LICENCIA_MOVIMIENTOS_RUTAS);
        this.app.use('/inicializacion-bd', INICIALIZACION_BASE_DATOS_RUTAS);
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