"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const loginRutas_1 = __importDefault(require("./rutas/login/loginRutas"));
const baseInicialRutas_1 = __importDefault(require("./rutas/baseInicial/baseInicialRutas"));
const baseEmpresaRutas_1 = __importDefault(require("./rutas/baseEmpresa/baseEmpresaRutas"));
const empresaRutas_1 = __importDefault(require("./rutas/empresa/empresaRutas"));
const licenciaRutas_1 = __importDefault(require("./rutas/licencia/licenciaRutas"));
const accesoRutas_1 = __importDefault(require("./rutas/acceso/accesoRutas"));
var io;
class Servidor {
    constructor() {
        this.app = (0, express_1.default)();
        this.configuracion();
        this.rutas();
        this.server = (0, http_1.createServer)(this.app);
        this.app.use((0, cors_1.default)());
    }
    configuracion() {
        this.app.set('puerto', process.env.PORT || 3010);
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json({ limit: '50mb' }));
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.set('trust proxy', true);
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'success'
            });
        });
    }
    rutas() {
        //this.app.use('/fulltime', EMPRESAS_RUTAS);//ruta para empresa
        //this.app.use('/parametrizacion', PARAMETRIZACION_RUTAS);//ruta datos inciales
        //this.app.use('/empleado', EMPLEADO_RUTAS);//ruta datos inciales
        this.app.use('/base-empresa', baseEmpresaRutas_1.default);
        this.app.use('/login', loginRutas_1.default);
        this.app.use('/base', baseInicialRutas_1.default);
        this.app.use('/empresa', empresaRutas_1.default);
        this.app.use('/licencia', licenciaRutas_1.default);
        this.app.use('/web-access', accesoRutas_1.default);
    }
    start() {
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
