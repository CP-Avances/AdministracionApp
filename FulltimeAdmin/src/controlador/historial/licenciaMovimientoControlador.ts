import { Request, Response } from 'express';
import pool from '../../database';

class LicenciaMovimientoControlador {

    public async ObtenerMovimientosLicencia(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            const fecha_inicio = req.query.fecha_inicio as string | undefined;
            const fecha_fin = req.query.fecha_fin as string | undefined;
            const id_licencia = req.query.id_licencia as string | undefined;
            const entidad_afectada = req.query.entidad_afectada as string | undefined;
            const tipo_movimiento = req.query.tipo_movimiento as string | undefined;
            const usuario_registra = req.query.usuario_registra as string | undefined;
            const campo_modificado = req.query.campo_modificado as string | undefined;

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const filtros: string[] = [];
            const valores: any[] = [];

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

            const MOVIMIENTOS = await pool.query(
                `
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
                `,
                valores
            );

            return res.jsonp(MOVIMIENTOS.rows);

        } catch (error) {
            console.log(error);

            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

}

export const licenciaMovimientoControlador = new LicenciaMovimientoControlador();
export default licenciaMovimientoControlador;