import { Request, Response } from 'express';
import pool from '../../../database';
import fs from 'fs/promises';
import path from 'path';

class LimiteAlmacenamientoControlador {

    public async GuardarLicenciaStorageUso(req: Request, res: Response) {
        const id_licencia_ = req.body.id_licencia;
        const storage_mb_usado_ = req.body.storage_mb_usado;
        const origen_calculo_ = req.body.origen_calculo ?? 'MANUAL';
        const fecha_registro_ = req.body.fecha_registro ?? null;
        const calculo_exitoso_ = req.body.calculo_exitoso ?? true;
        const mensaje_error_ = req.body.mensaje_error ?? null;
        const observacion_ = req.body.observacion ?? null;

        try {
            if (!id_licencia_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar la licencia.'
                });
            }

            const resultado = await pool.query(
                `
                INSERT INTO public.licencia_storage_uso (
                    id_licencia,
                    storage_mb_usado,
                    origen_calculo,
                    fecha_registro,
                    fecha_calculo,
                    calculo_exitoso,
                    mensaje_error,
                    observacion
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    COALESCE($4::date, CURRENT_DATE),
                    now(),
                    $5,
                    $6,
                    $7
                )
                ON CONFLICT (id_licencia)
                DO UPDATE SET
                    storage_mb_usado = EXCLUDED.storage_mb_usado,
                    origen_calculo = EXCLUDED.origen_calculo,
                    fecha_registro = EXCLUDED.fecha_registro,
                    fecha_calculo = now(),
                    calculo_exitoso = EXCLUDED.calculo_exitoso,
                    mensaje_error = EXCLUDED.mensaje_error,
                    observacion = EXCLUDED.observacion
                RETURNING *;
                `,
                [
                    id_licencia_,
                    Number(storage_mb_usado_ ?? 0),
                    origen_calculo_,
                    fecha_registro_,
                    calculo_exitoso_ === true,
                    mensaje_error_,
                    observacion_
                ]
            );

            return res.jsonp({
                message: 'Registro actualizado.',
                data: resultado.rows[0]
            });
        }
        catch (error: any) {
            console.log(error);

            if (error.code === '23514') {
                return res.status(400).jsonp({
                    message: 'Los datos enviados no cumplen las validaciones de storage.'
                });
            }

            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

    public async ObtenerStorageLicenciaActiva(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const STORAGE = await pool.query(
                `
                SELECT 
                    su.id_storage_uso,
                    su.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    su.storage_mb_usado,
                    su.origen_calculo,
                    su.fecha_registro,
                    su.fecha_calculo,
                    su.calculo_exitoso,
                    su.mensaje_error,
                    su.observacion
                FROM public.licencia_storage_uso su
                INNER JOIN public.licencia l
                    ON l.id_licencia = su.id_licencia
                WHERE l.id_empresa = $1
                  AND l.estado = 'ACTIVA';
                `,
                [id_empresa]
            );

            return res.jsonp(STORAGE.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

    public async ObtenerTodosStorageLicencia(req: Request, res: Response) {
        try {
            const id_empresa = Number(req.params.id_empresa);

            if (!id_empresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const STORAGE = await pool.query(
                `
                SELECT 
                    su.id_storage_uso,
                    su.id_licencia,
                    l.estado,
                    l.fecha_activacion,
                    l.fecha_desactivacion,
                    su.storage_mb_usado,
                    su.origen_calculo,
                    su.fecha_registro,
                    su.fecha_calculo,
                    su.calculo_exitoso,
                    su.mensaje_error,
                    su.observacion
                FROM public.licencia_storage_uso su
                INNER JOIN public.licencia l
                    ON l.id_licencia = su.id_licencia
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
                    su.fecha_calculo DESC;
                `,
                [id_empresa]
            );

            return res.jsonp(STORAGE.rows);
        }
        catch (error) {
            console.log(error);
            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

    public async ObtenerEmpresasInternasStorage(req: Request, res: Response) {
        try {
            const EMPRESAS = await pool.query(
                `
            SELECT DISTINCT
                e.empresa_id,
                e.empresa_codigo,
                e.empresa_descripcion,
                e.instalacion,
                e.estado,

                l.id_licencia,
                l.estado AS estado_licencia,

                COALESCE(ll.storage_mb_max, 0) AS storage_mb_contratado

            FROM public.empresa e

            INNER JOIN public.empresa_bdd bd
                ON bd.id_empresa = e.empresa_id

            INNER JOIN public.licencia l
                ON l.id_empresa = e.empresa_id
               AND l.estado = 'ACTIVA'

            LEFT JOIN public.licencia_limite ll
                ON ll.id_licencia = l.id_licencia

            WHERE e.estado IS TRUE
              AND e.instalacion = 'INTERNA'

            ORDER BY e.empresa_descripcion ASC;
            `
            );

            return res.jsonp(EMPRESAS.rows);

        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({
                message: 'error'
            });
        }
    }

    private async CalcularTamanoCarpetaBytes(rutaCarpeta: string): Promise<number> {
        let totalBytes = 0;

        try {
            const elementos = await fs.readdir(rutaCarpeta, { withFileTypes: true });

            for (const elemento of elementos) {
                const rutaCompleta = path.join(rutaCarpeta, elemento.name);

                if (elemento.isDirectory()) {
                    totalBytes += await this.CalcularTamanoCarpetaBytes(rutaCompleta);
                }
                else if (elemento.isFile()) {
                    const stats = await fs.stat(rutaCompleta);
                    totalBytes += stats.size;
                }
            }

            return totalBytes;
        }
        catch (error: any) {
            if (error?.code === 'ENOENT') {
                return 0;
            }

            throw error;
        }
    }

    private ConvertirBytesAMb(bytes: number): number {
        return Number((bytes / 1024 / 1024).toFixed(2));
    }

    private LimpiarCodigoEmpresa(codigoEmpresa: any): string {
        return String(codigoEmpresa ?? '').trim();
    }


    public async CalcularStorageEmpresa(req: Request, res: Response) {
        try {
            const codigo_empresa_ = this.LimpiarCodigoEmpresa(req.body.codigo_empresa);

            if (!codigo_empresa_) {
                return res.status(400).jsonp({
                    message: 'Debe enviar el código de empresa.'
                });
            }

            const rutaBase = process.env.RUTA_ARCHIVOS_BASE;

            if (!rutaBase) {
                return res.status(500).jsonp({
                    message: 'No se encuentra configurada la ruta base de archivos.'
                });
            }

            const rutaEmpresa = path.join(rutaBase, codigo_empresa_);

            const totalBytes = await this.CalcularTamanoCarpetaBytes(rutaEmpresa);
            const storageMbUsado = this.ConvertirBytesAMb(totalBytes);

            return res.jsonp({
                message: 'Storage calculado correctamente.',
                data: {
                    codigo_empresa: codigo_empresa_,
                    storage_mb_usado: storageMbUsado,
                    total_bytes: totalBytes
                }
            });
        }
        catch (error: any) {
            console.log(error);

            return res.status(500).jsonp({
                message: 'No se pudo calcular el almacenamiento de la empresa.',
                error: error?.message ?? null
            });
        }
    }

}

export const limiteAlmacenamientoControlador = new LimiteAlmacenamientoControlador();
export default limiteAlmacenamientoControlador;