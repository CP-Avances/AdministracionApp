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
exports.licenciaMovimientoControlador = void 0;
const database_1 = __importDefault(require("../../database"));
class LicenciaMovimientoControlador {
    ObtenerMovimientosLicencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id_empresa = Number(req.params.id_empresa);
                const fecha_inicio = req.query.fecha_inicio;
                const fecha_fin = req.query.fecha_fin;
                const id_licencia = req.query.id_licencia;
                const entidad_afectada = req.query.entidad_afectada;
                const tipo_movimiento = req.query.tipo_movimiento;
                const usuario_registra = req.query.usuario_registra;
                const campo_modificado = req.query.campo_modificado;
                if (!id_empresa) {
                    return res.status(400).jsonp({
                        message: 'El id de empresa no es válido.'
                    });
                }
                const filtros = [];
                const valores = [];
                valores.push(id_empresa);
                filtros.push(`l.id_empresa = $1`);
                if (fecha_inicio) {
                    valores.push(fecha_inicio);
                    filtros.push(`lm.fecha_movimiento::date >= $${valores.length}::date`);
                }
                if (fecha_fin) {
                    valores.push(fecha_fin);
                    filtros.push(`lm.fecha_movimiento::date <= $${valores.length}::date`);
                }
                if (id_licencia) {
                    valores.push(Number(id_licencia));
                    filtros.push(`lm.id_licencia = $${valores.length}`);
                }
                if (entidad_afectada) {
                    valores.push(entidad_afectada);
                    filtros.push(`lm.entidad_afectada = $${valores.length}`);
                }
                if (tipo_movimiento) {
                    valores.push(tipo_movimiento);
                    filtros.push(`lm.tipo_movimiento = $${valores.length}`);
                }
                if (usuario_registra) {
                    valores.push(`%${usuario_registra}%`);
                    filtros.push(`lm.usuario_registra ILIKE $${valores.length}`);
                }
                if (campo_modificado) {
                    valores.push(`%${campo_modificado}%`);
                    filtros.push(`lm.campo_modificado ILIKE $${valores.length}`);
                }
                const MOVIMIENTOS = yield database_1.default.query(`
                SELECT
                    lm.id_licencia_movimiento,
                    lm.id_licencia,
                    l.id_empresa,
                    e.empresa_descripcion,
                    e.empresa_codigo,
                    l.estado AS estado_licencia,
                    lm.tipo_movimiento,
                    lm.entidad_afectada,
                    lm.campo_modificado,
                    lm.valor_anterior,
                    lm.valor_nuevo,
                    lm.fecha_movimiento,
                    lm.usuario_registra,
                    lm.observacion
                FROM public.licencia_movimiento lm
                INNER JOIN public.licencia l
                    ON l.id_licencia = lm.id_licencia
                INNER JOIN public.empresa e
                    ON e.empresa_id = l.id_empresa
                WHERE ${filtros.join(' AND ')}
                ORDER BY 
                    lm.fecha_movimiento DESC,
                    lm.id_licencia_movimiento DESC;
                `, valores);
                return res.jsonp(MOVIMIENTOS.rows);
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({
                    message: 'error'
                });
            }
        });
    }
}
exports.licenciaMovimientoControlador = new LicenciaMovimientoControlador();
exports.default = exports.licenciaMovimientoControlador;
