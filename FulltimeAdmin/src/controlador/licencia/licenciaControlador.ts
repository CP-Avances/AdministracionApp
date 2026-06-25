import { Request, Response } from 'express';
import pool from '../../database';
import { QueryResult } from 'pg';
import { FUNCIONES_LLAVES } from '../llaves/rsa-keys.service';

class LicenciaControlador {

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

    public async RegistrarLicencia(req: Request, res: Response) {
        const id_empresa_ = req.body.id_empresa;
        const empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
        const empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;
        const observacion_ = req.body.observacion ?? null;
        const usuario_registra_ = req.body.usuario_registra ?? 'SISTEMA';

        const client = await pool.connect();

        try {
            if (!id_empresa_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la empresa.'
                });
            }

            const licencia_datos = {
                id_empresa: id_empresa_,
                fecha_activacion: empresa_licencia_fecha_activacion_,
                fecha_desactivacion: empresa_licencia_fecha_desactivacion_
            };

            const jsonEncriptado = FUNCIONES_LLAVES.encriptarDatos(
                JSON.stringify(licencia_datos)
            );

            if (jsonEncriptado === null) {
                return res.status(500).jsonp({ message: 'error' });
            }

            await client.query('BEGIN');

            const response: QueryResult = await client.query(
                `
                INSERT INTO public.licencia (
                    id_empresa,
                    llave_publica,
                    fecha_activacion,
                    fecha_desactivacion,
                    observacion
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
                `,
                [
                    licencia_datos.id_empresa,
                    jsonEncriptado,
                    licencia_datos.fecha_activacion,
                    licencia_datos.fecha_desactivacion,
                    observacion_
                ]
            );

            const [registro_licencia] = response.rows;

            if (!registro_licencia) {
                await client.query('ROLLBACK');
                return res.status(404).jsonp({ message: 'error' });
            }

            await this.RegistrarMovimientoLicencia(client, {
                id_licencia: registro_licencia.id_licencia,
                tipo_movimiento: 'REGISTRO_LICENCIA',
                entidad_afectada: 'licencia',
                campo_modificado: null,
                valor_anterior: null,
                valor_nuevo: JSON.stringify({
                    estado: registro_licencia.estado,
                    fecha_activacion: registro_licencia.fecha_activacion,
                    fecha_desactivacion: registro_licencia.fecha_desactivacion,
                    observacion: registro_licencia.observacion
                }),
                usuario_registra: usuario_registra_,
                observacion: 'Registro inicial de licencia.'
            });

            await client.query('COMMIT');

            return res.status(200).jsonp({
                message: 'ok',
                data: registro_licencia
            });

        } catch (error: any) {
            await client.query('ROLLBACK');

            console.log('ver error ', error);

            if (error.code === '23505') {
                return res.status(409).jsonp({
                    message: 'Ya existe una licencia activa para esta empresa.'
                });
            }

            return res.status(500).jsonp({ message: 'error' });
        } finally {
            client.release();
        }
    }

    public async ActualizarLicencia(req: Request, res: Response) {
        const id_licencia_ = req.body.id_empresa_licencia;
        const estado_ = req.body.estado;
        const empresa_licencia_fecha_activacion_ = req.body.fecha_activacion;
        const empresa_licencia_fecha_desactivacion_ = req.body.fecha_desactivacion;
        const observacion_ = req.body.observacion ?? null;
        const usuario_registra_ = req.body.usuario_registra ?? 'SISTEMA';

        const client = await pool.connect();

        try {
            if (!id_licencia_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la licencia.'
                });
            }

            await client.query('BEGIN');

            const licenciaAnterior = await client.query(
                `
                SELECT *
                FROM public.licencia
                WHERE id_licencia = $1;
                `,
                [id_licencia_]
            );

            if (licenciaAnterior.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).jsonp({
                    message: 'No se encontró la licencia.'
                });
            }

            const datosAnteriores = licenciaAnterior.rows[0];

            const licencia_datos = {
                id_empresa: datosAnteriores.id_empresa,
                fecha_activacion: empresa_licencia_fecha_activacion_,
                fecha_desactivacion: empresa_licencia_fecha_desactivacion_
            };

            const jsonEncriptado = FUNCIONES_LLAVES.encriptarDatos(
                JSON.stringify(licencia_datos)
            );

            if (jsonEncriptado === null) {
                await client.query('ROLLBACK');
                return res.status(500).jsonp({ message: 'error' });
            }

            const response = await client.query(
                `
                UPDATE public.licencia
                SET
                    estado = $2,
                    llave_publica = $3,
                    fecha_activacion = $4,
                    fecha_desactivacion = $5,
                    observacion = $6,
                    fecha_actualizacion = now()
                WHERE id_licencia = $1
                RETURNING *;
                `,
                [
                    id_licencia_,
                    estado_,
                    jsonEncriptado,
                    empresa_licencia_fecha_activacion_,
                    empresa_licencia_fecha_desactivacion_,
                    observacion_
                ]
            );

            const datosActualizados = response.rows[0];

            await this.RegistrarMovimientosActualizacionLicencia(
                client,
                datosAnteriores,
                datosActualizados,
                usuario_registra_
            );

            await client.query('COMMIT');

            return res.jsonp({
                message: 'Registro actualizado.',
                data: datosActualizados
            });

        } catch (error: any) {
            await client.query('ROLLBACK');

            console.log(error);

            if (error.code === '23505') {
                return res.status(409).jsonp({
                    message: 'Ya existe una licencia activa para esta empresa.'
                });
            }

            return res.status(500).jsonp({ message: 'error' });
        } finally {
            client.release();
        }
    }

    private async RegistrarMovimientosActualizacionLicencia(
        client: any,
        anterior: any,
        actual: any,
        usuario_registra: string
    ) {
        const movimientos = [
            {
                campo: 'estado',
                valorAnterior: anterior.estado,
                valorNuevo: actual.estado
            },
            {
                campo: 'fecha_activacion',
                valorAnterior: anterior.fecha_activacion,
                valorNuevo: actual.fecha_activacion
            },
            {
                campo: 'fecha_desactivacion',
                valorAnterior: anterior.fecha_desactivacion,
                valorNuevo: actual.fecha_desactivacion
            },
            {
                campo: 'observacion',
                valorAnterior: anterior.observacion,
                valorNuevo: actual.observacion
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
                    id_licencia: actual.id_licencia,
                    tipo_movimiento: 'ACTUALIZACION_LICENCIA',
                    entidad_afectada: 'licencia',
                    campo_modificado: movimiento.campo,
                    valor_anterior: valorAnterior,
                    valor_nuevo: valorNuevo,
                    usuario_registra,
                    observacion: 'Actualización manual de datos de licencia.'
                });
            }
        }
    }

    public async BuscarLicenciaPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const LICENCIAS = await pool.query(
                `
                SELECT *
                FROM public.licencia empresa_licencia
                WHERE empresa_licencia.id_empresa = $1
                ORDER BY 
                    CASE 
                        WHEN empresa_licencia.estado = 'ACTIVA' THEN 1
                        WHEN empresa_licencia.estado = 'PENDIENTE' THEN 2
                        WHEN empresa_licencia.estado = 'SUSPENDIDA' THEN 3
                        WHEN empresa_licencia.estado = 'VENCIDA' THEN 4
                        WHEN empresa_licencia.estado = 'CANCELADA' THEN 5
                        ELSE 6
                    END,
                    empresa_licencia.fecha_creacion DESC;
                `,
                [id]
            );

            return res.jsonp(LICENCIAS.rows);

        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'error' });
        }
    }

}

export const licenciaControlador = new LicenciaControlador();
export default licenciaControlador;