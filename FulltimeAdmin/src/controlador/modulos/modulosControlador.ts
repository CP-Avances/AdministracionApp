import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';
import { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class ModulosControlador {


    public async ObtenerModulos(req: Request, res: Response) {
        try {
            const MODULOS = await pool.query(
                `
                SELECT * FROM modulo ORDER BY id_modulo ASC;
                `
            );

            if (MODULOS.rowCount !== null) {
                if (MODULOS.rowCount > 0) {
                    return res.jsonp(MODULOS.rows);
                } else {
                    res.status(404).jsonp({ message: 'vacio' });
                }
            } else {
                res.status(500).jsonp({ message: 'error' });
            }
        }
        catch (error) {
            res.status(500).jsonp({ message: 'error' });
        }
    }


    public async ObtenerModulosActivos(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const MODULOS = await pool.query(
                `
                SELECT DISTINCT
                    lm.id_licencia_modulo,
                    lm.id_licencia,
                    lm.id_modulo,
                    m.codigo,
                    m.nombre,
                    m.descripcion,
                    lm.activo,
                    lm.fecha_activacion,
                    lm.fecha_desactivacion,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM licencia_modulo lm
                INNER JOIN licencia l 
                    ON l.id_licencia = lm.id_licencia
                INNER JOIN modulo m
                    ON m.id_modulo = lm.id_modulo
                WHERE l.id_empresa = $1
                    AND lm.activo IS TRUE
                    AND l.estado = 'ACTIVA'
                ORDER BY m.nombre;
                `,
                [id_empresa]
            );

            return res.jsonp(MODULOS.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'error' });
        }
    }


    public async GuardarLicenciaModulos(req: Request, res: Response) {
        const id_licencia_ = req.body.id_licencia;
        const modulos_ = req.body.modulos;
        const usuario_registra_ = req.body.usuario_registra ?? 'SISTEMA';

        const client = await pool.connect();

        try {
            if (!id_licencia_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la licencia.'
                });
            }

            if (!Array.isArray(modulos_) || modulos_.length === 0) {
                return res.status(400).jsonp({
                    message: 'Debe enviar al menos un módulo.'
                });
            }

            await client.query('BEGIN');

            const registrosAnteriores = await client.query(
                `
            SELECT 
                lm.id_modulo,
                lm.activo,
                m.codigo,
                m.nombre
            FROM public.licencia_modulo lm
            INNER JOIN public.modulo m
                ON m.id_modulo = lm.id_modulo
            WHERE lm.id_licencia = $1;
            `,
                [id_licencia_]
            );

            const mapaAnteriores = new Map<number, any>();

            for (const registro of registrosAnteriores.rows) {
                mapaAnteriores.set(Number(registro.id_modulo), registro);
            }

            for (const modulo of modulos_) {
                const idModulo = Number(modulo.id_modulo);
                const activoNuevo = modulo.activo === true;
                const registroAnterior = mapaAnteriores.get(idModulo);

                const datosModulo = await client.query(
                    `
                SELECT 
                    codigo,
                    nombre
                FROM public.modulo
                WHERE id_modulo = $1;
                `,
                    [idModulo]
                );

                const nombreModulo = datosModulo.rows[0]?.nombre ?? `Módulo ${idModulo}`;

                await client.query(
                    `
                INSERT INTO public.licencia_modulo (
                    id_licencia,
                    id_modulo,
                    activo,
                    fecha_activacion,
                    fecha_desactivacion,
                    fecha_creacion,
                    fecha_actualizacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    CASE WHEN $3 = true THEN now() ELSE NULL END,
                    CASE WHEN $3 = false THEN now() ELSE NULL END,
                    now(),
                    now()
                )
                ON CONFLICT (id_licencia, id_modulo)
                DO UPDATE SET
                    activo = EXCLUDED.activo,
                    fecha_activacion = CASE
                        WHEN EXCLUDED.activo = true AND licencia_modulo.activo = false THEN now()
                        WHEN EXCLUDED.activo = true AND licencia_modulo.fecha_activacion IS NULL THEN now()
                        WHEN EXCLUDED.activo = false THEN NULL
                        ELSE licencia_modulo.fecha_activacion
                    END,
                    fecha_desactivacion = CASE
                        WHEN EXCLUDED.activo = false AND licencia_modulo.activo = true THEN now()
                        WHEN EXCLUDED.activo = false AND licencia_modulo.fecha_desactivacion IS NULL THEN now()
                        WHEN EXCLUDED.activo = true THEN NULL
                        ELSE licencia_modulo.fecha_desactivacion
                    END,
                    fecha_actualizacion = now()
                RETURNING 
                    id_licencia_modulo,
                    id_licencia,
                    id_modulo,
                    activo;
                `,
                    [
                        id_licencia_,
                        idModulo,
                        activoNuevo
                    ]
                );

                if (!registroAnterior) {
                    await this.RegistrarMovimientoLicencia(client, {
                        id_licencia: Number(id_licencia_),
                        tipo_movimiento: 'REGISTRO_MODULO',
                        entidad_afectada: 'licencia_modulo',
                        campo_modificado: nombreModulo,
                        valor_anterior: null,
                        valor_nuevo: String(activoNuevo),
                        usuario_registra: usuario_registra_,
                        observacion: `Registro inicial del módulo ${nombreModulo}.`
                    });

                    continue;
                }

                const activoAnterior = registroAnterior.activo === true;

                if (activoAnterior !== activoNuevo) {
                    await this.RegistrarMovimientoLicencia(client, {
                        id_licencia: Number(id_licencia_),
                        tipo_movimiento: 'ACTUALIZACION_MODULO',
                        entidad_afectada: 'licencia_modulo',
                        campo_modificado: nombreModulo,
                        valor_anterior: String(activoAnterior),
                        valor_nuevo: String(activoNuevo),
                        usuario_registra: usuario_registra_,
                        observacion: `Cambio de estado del módulo ${nombreModulo}.`
                    });
                }
            }

            await client.query('COMMIT');

            return res.jsonp({
                message: 'Registros actualizados.'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.log(error);

            return res.status(500).jsonp({
                message: 'error'
            });

        } finally {
            client.release();
        }
    }

    public async ObtenerTodosModulosLicencia(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const MODULOS = await pool.query(
                `
                SELECT
                    lm.id_licencia_modulo,
                    lm.id_licencia,
	                l.estado,
                    lm.id_modulo,
                    m.codigo,
                    m.nombre,
                    m.descripcion,
                    lm.activo,
                    lm.fecha_activacion,
                    lm.fecha_desactivacion,
                    lm.fecha_creacion,
                    lm.fecha_actualizacion
                FROM licencia_modulo lm
                INNER JOIN licencia l 
                    ON l.id_licencia = lm.id_licencia
                INNER JOIN modulo m
                    ON m.id_modulo = lm.id_modulo
                WHERE l.id_empresa = $1
                ORDER BY l.estado ASC, lm.id_licencia ASC, m.id_modulo ASC;
                `,
                [id_empresa]
            );

            return res.jsonp(MODULOS.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'error' });
        }
    }



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

}

export const modulosControlador = new ModulosControlador;
export default modulosControlador;