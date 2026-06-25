"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.empresaControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class EmpresaControlador {
    // MEJORAS IMPLEMENTADAS EN BASE DE DATOS
    // REGISTRAR DATOS DE EMPRESA
    RegistrarDatosEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_codigo_ = req.body.empresa_codigo;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let instalacion_ = req.body.instalacion;
            let zona_horaria_ = req.body.zona_horaria;
            try {
                const response = yield database_1.default.query(`
                INSERT INTO empresa (empresa_codigo, empresa_descripcion, zona_horaria, instalacion)
                     VALUES ($1, $2, $3, $4) RETURNING *
                `, [empresa_codigo_, empresa_descripcion_, zona_horaria_, instalacion_]);
                const [registro_empresa] = response.rows;
                if (registro_empresa) {
                    return res.status(200).jsonp({ message: 'ok' });
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    // METODO PARA ACTUALIZAR EMPRESA
    ActualizarDatosEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let empresa_id_ = req.body.empresa_id;
            let empresa_codigo_ = req.body.empresa_codigo;
            let empresa_descripcion_ = req.body.empresa_descripcion;
            let empresa_estado_ = req.body.estado;
            let empresa_zona_horaria_ = req.body.zona_horaria;
            let empresa_instalacion_ = req.body.instalacion;
            try {
                yield database_1.default.query(`
                UPDATE empresa SET empresa_codigo = $2, empresa_descripcion = $3, 
                estado = $4, zona_horaria = $5, instalacion = $6, fecha_actualizacion = now()
                WHERE empresa_id = $1
                `, [empresa_id_, empresa_codigo_, empresa_descripcion_, empresa_estado_, empresa_zona_horaria_, empresa_instalacion_]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: error });
            }
        });
    }
    // METODO PARA ELIMINAR EMPRESAS
    EliminarEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let empresa_id_ = req.body.empresa_id;
                yield database_1.default.query(`
                DELETE FROM empresa WHERE empresa_id = $1
                `, [empresa_id_]);
                res.jsonp({ message: 'Registro eliminado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA LISTAR DATOS DE EMPRESA
    ListarEmpresaId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const EMPRESA = yield database_1.default.query(`
            SELECT * FROM empresa WHERE empresa_id = $1
            `, [id]);
            if (EMPRESA.rowCount != 0) {
                return res.jsonp(EMPRESA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA LISTAR DATOS DE EMPRESA
    ObtenerEmpresas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const EMPRESAS = yield database_1.default.query(`
                SELECT 
                empresa_id, empresa_codigo, empresa_descripcion, estado, instalacion 
                FROM empresa ORDER BY estado DESC
                `);
                if (EMPRESAS.rowCount !== null) {
                    if (EMPRESAS.rowCount > 0) {
                        return res.jsonp(EMPRESAS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA OBTENER ZONAS HORARIAS
    ObtenerZonasHorarias(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ZONAS = yield database_1.default.query(`
                SELECT * FROM zonas_horarias ORDER BY nombre_general ASC
                `);
                if (ZONAS.rowCount !== null) {
                    if (ZONAS.rowCount > 0) {
                        return res.jsonp(ZONAS.rows);
                    }
                    else {
                        res.status(404).jsonp({ message: 'vacio' });
                    }
                }
                else {
                    res.status(500).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                res.status(500).jsonp({ message: 'error' });
            }
        });
    }
}
exports.empresaControlador = new EmpresaControlador;
exports.default = exports.empresaControlador;
