import { Request, Response } from 'express';
import pool from '../../../database';

class LimiteUsuariosControlador {

    private async RegistrarMovimientoLicencia(
        client: any,
        datos: {
            id_licencia: number;
            tipo_movimiento: string;
            entidad_afectada: string;
            campo_modificado?: string | null;
            valor_anterior?: string | null;
            valor_nuevo?: string | null;
            usuario_registra?: string | null;
            observacion?: string | null;
        }
    ) {
        await client.query(
            `
            INSERT INTO public.licencia_movimiento (
                id_licencia,
                tipo_movimiento,
                entidad_afectada,
                campo_modificado,
                valor_anterior,
                valor_nuevo,
                fecha_movimiento,
                usuario_registra,
                observacion
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                now(),
                $7,
                $8
            );
            `,
            [
                datos.id_licencia,
                datos.tipo_movimiento,
                datos.entidad_afectada,
                datos.campo_modificado ?? null,
                datos.valor_anterior ?? null,
                datos.valor_nuevo ?? null,
                datos.usuario_registra ?? null,
                datos.observacion ?? null
            ]
        );
    }

    public async RegistrarLicenciaLimite(req: Request, res: Response) {
        const id_licencia_ = req.body.id_licencia;
        const usuarios_web_max_ = Number(req.body.usuarios_web_max ?? 0);
        const usuarios_app_max_ = Number(req.body.usuarios_app_max ?? 0);
        const relojes_max_ = Number(req.body.relojes_max ?? 0);
        const storage_mb_max_ = Number(req.body.storage_mb_max ?? 0);
        const usuario_registra_ = req.body.usuario_registra ?? 'SISTEMA';

        const client = await pool.connect();

        try {
            if (!id_licencia_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la licencia.'
                });
            }

            await client.query('BEGIN');

            const resultado = await client.query(
                `
                INSERT INTO public.licencia_limite (
                    id_licencia,
                    usuarios_web_max,
                    usuarios_app_max,
                    relojes_max,
                    storage_mb_max,
                    fecha_creacion,
                    fecha_actualizacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    now(),
                    now()
                )
                RETURNING *;
                `,
                [
                    id_licencia_,
                    usuarios_web_max_,
                    usuarios_app_max_,
                    relojes_max_,
                    storage_mb_max_
                ]
            );

            const limiteRegistrado = resultado.rows[0];

            await this.RegistrarMovimientoLicencia(client, {
                id_licencia: Number(id_licencia_),
                tipo_movimiento: 'REGISTRO_LIMITE',
                entidad_afectada: 'licencia_limite',
                campo_modificado: null,
                valor_anterior: null,
                valor_nuevo: JSON.stringify({
                    usuarios_web_max: limiteRegistrado.usuarios_web_max,
                    usuarios_app_max: limiteRegistrado.usuarios_app_max,
                    relojes_max: limiteRegistrado.relojes_max,
                    storage_mb_max: limiteRegistrado.storage_mb_max
                }),
                usuario_registra: usuario_registra_,
                observacion: 'Registro inicial de límites de licencia.'
            });

            await client.query('COMMIT');

            return res.jsonp({
                message: 'Registro guardado.',
                data: limiteRegistrado
            });
        }
        catch (error: any) {
            await client.query('ROLLBACK');
            console.log(error);

            if (error.code === '23505') {
                return res.status(409).jsonp({
                    message: 'Ya existen límites registrados para esta licencia.'
                });
            }

            return res.status(500).jsonp({
                message: 'error'
            });
        }
        finally {
            client.release();
        }
    }

    public async ActualizarLicenciaLimite(req: Request, res: Response) {
        const id_licencia_limite_ = req.body.id_licencia_limite;
        const id_licencia_ = req.body.id_licencia;
        const usuarios_web_max_ = Number(req.body.usuarios_web_max ?? 0);
        const usuarios_app_max_ = Number(req.body.usuarios_app_max ?? 0);
        const relojes_max_ = Number(req.body.relojes_max ?? 0);
        const storage_mb_max_ = Number(req.body.storage_mb_max ?? 0);
        const usuario_registra_ = req.body.usuario_registra ?? 'SISTEMA';

        const client = await pool.connect();

        try {
            if (!id_licencia_limite_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar el registro de límite.'
                });
            }

            if (!id_licencia_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la licencia.'
                });
            }

            await client.query('BEGIN');

            const consultaAnterior = await client.query(
                `
                SELECT *
                FROM public.licencia_limite
                WHERE id_licencia_limite = $1;
                `,
                [id_licencia_limite_]
            );

            if (consultaAnterior.rowCount === 0) {
                await client.query('ROLLBACK');

                return res.status(404).jsonp({
                    message: 'No se encontró el registro de límites.'
                });
            }

            const limiteAnterior = consultaAnterior.rows[0];

            const resultado = await client.query(
                `
                UPDATE public.licencia_limite
                SET
                    id_licencia = $1,
                    usuarios_web_max = $2,
                    usuarios_app_max = $3,
                    relojes_max = $4,
                    storage_mb_max = $5,
                    fecha_actualizacion = now()
                WHERE id_licencia_limite = $6
                RETURNING *;
                `,
                [
                    id_licencia_,
                    usuarios_web_max_,
                    usuarios_app_max_,
                    relojes_max_,
                    storage_mb_max_,
                    id_licencia_limite_
                ]
            );

            const limiteActualizado = resultado.rows[0];

            await this.RegistrarMovimientosActualizacionLimite(
                client,
                limiteAnterior,
                limiteActualizado,
                usuario_registra_
            );

            await client.query('COMMIT');

            return res.jsonp({
                message: 'Registro actualizado.',
                data: limiteActualizado
            });
        }
        catch (error: any) {
            await client.query('ROLLBACK');
            console.log(error);

            if (error.code === '23505') {
                return res.status(409).jsonp({
                    message: 'Ya existen límites registrados para esta licencia.'
                });
            }

            return res.status(500).jsonp({
                message: 'error'
            });
        }
        finally {
            client.release();
        }
    }

    private async RegistrarMovimientosActualizacionLimite(
        client: any,
        anterior: any,
        actual: any,
        usuario_registra: string
    ) {
        const movimientos = [
            {
                campo: 'usuarios_web_max',
                valorAnterior: anterior.usuarios_web_max,
                valorNuevo: actual.usuarios_web_max
            },
            {
                campo: 'usuarios_app_max',
                valorAnterior: anterior.usuarios_app_max,
                valorNuevo: actual.usuarios_app_max
            },
            {
                campo: 'relojes_max',
                valorAnterior: anterior.relojes_max,
                valorNuevo: actual.relojes_max
            },
            {
                campo: 'storage_mb_max',
                valorAnterior: anterior.storage_mb_max,
                valorNuevo: actual.storage_mb_max
            }
        ];

        for (const movimiento of movimientos) {
            const valorAnterior = movimiento.valorAnterior === null || movimiento.valorAnterior === undefined
                ? null
                : String(movimiento.valorAnterior);

            const valorNuevo = movimiento.valorNuevo === null || movimiento.valorNuevo === undefined
                ? null
                : String(movimiento.valorNuevo);

            if (valorAnterior !== valorNuevo) {
                await this.RegistrarMovimientoLicencia(client, {
                    id_licencia: Number(actual.id_licencia),
                    tipo_movimiento: 'ACTUALIZACION_LIMITE',
                    entidad_afectada: 'licencia_limite',
                    campo_modificado: movimiento.campo,
                    valor_anterior: valorAnterior,
                    valor_nuevo: valorNuevo,
                    usuario_registra,
                    observacion: 'Actualización manual de límites de licencia.'
                });
            }
        }
    }

    public async ObtenerLimiteLicenciaActiva(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const LIMITES = await pool.query(
                `
                SELECT 
                    lm.id_licencia_limite,
                    lm.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    lm.usuarios_web_max,
                    lm.usuarios_app_max,
                    lm.relojes_max,
                    lm.storage_mb_max,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM public.licencia_limite lm
                INNER JOIN public.licencia l 
                    ON l.id_licencia = lm.id_licencia
                WHERE l.id_empresa = $1
                  AND l.estado = 'ACTIVA';
                `,
                [id_empresa]
            );

            return res.jsonp(LIMITES.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

    public async ObtenerTodosLimitesLicencia(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const LIMITES = await pool.query(
                `
                SELECT 
                    lm.id_licencia_limite,
                    lm.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    lm.usuarios_web_max,
                    lm.usuarios_app_max,
                    lm.relojes_max,
                    lm.storage_mb_max,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM public.licencia_limite lm
                INNER JOIN public.licencia l 
                    ON l.id_licencia = lm.id_licencia
                WHERE l.id_empresa = $1
                ORDER BY 
                    CASE 
                        WHEN l.estado = 'ACTIVA' THEN 1
                        WHEN l.estado = 'PENDIENTE' THEN 2
                        WHEN l.estado = 'SUSPENDIDA' THEN 3
                        WHEN l.estado = 'VENCIDA' THEN 4
                        WHEN l.estado = 'CANCELADA' THEN 5
                        ELSE 6
                    END,
                    l.fecha_creacion DESC;
                `,
                [id_empresa]
            );

            return res.jsonp(LIMITES.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }
}

export const limiteUsuariosControlador = new LimiteUsuariosControlador();
export default limiteUsuariosControlador;