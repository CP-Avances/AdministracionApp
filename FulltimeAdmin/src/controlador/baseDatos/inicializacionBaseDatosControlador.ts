import { Request, Response } from 'express';
import pool from '../../database';
import { CrearClientePostgresAdmin, CrearClientePostgresBase } from '../../libs/baseDatos/postgresAdmin';
import fs from 'fs/promises';

type PasoInicializacionBd = 'CREAR_BASE' | 'TABLAS' | 'VISTAS' | 'DATOS_INICIALES';

type DatosLogInicializacionBd = {
    id_empresa?: number | null;
    empresa_codigo?: string | null;
    nombre_base: string;
    paso: PasoInicializacionBd;
    archivo?: string | null;
    exitoso: boolean;
    mensaje?: string | null;
    usuario_registra?: string | null;
};

class InicializacionBaseDatosControlador {

    private LimpiarNombreBase(nombreBase: any): string {
        const nombre = String(nombreBase ?? '').trim().toLowerCase();

        if (!nombre) {
            throw new Error('Debe enviar el nombre de la base de datos.');
        }

        if (nombre.length > 63) {
            throw new Error('El nombre de la base no puede superar los 63 caracteres.');
        }

        const patronPermitido = /^[a-z][a-z0-9_]*$/;

        if (!patronPermitido.test(nombre)) {
            throw new Error(
                'El nombre de la base debe iniciar con una letra y solo puede contener letras, números y guion bajo.'
            );
        }

        return nombre;
    }

    private EscaparIdentificadorPostgres(valor: string): string {
        return `"${valor.replace(/"/g, '""')}"`;
    }

    private ObtenerIdEmpresa(req: Request): number | null {
        return Number(req.body.id_empresa ?? 0) || null;
    }

    private ObtenerEmpresaCodigo(req: Request): string | null {
        return String(req.body.empresa_codigo ?? '').trim() || null;
    }

    private ObtenerUsuarioRegistra(req: Request): string | null {
        return String(req.body.usuario_registra ?? '').trim() || null;
    }

    private async RegistrarLogInicializacion(datos: DatosLogInicializacionBd): Promise<void> {
        try {
            await pool.query(
                `
                INSERT INTO public.empresa_inicializacion_bd_log (
                    id_empresa,
                    empresa_codigo,
                    nombre_base,
                    paso,
                    archivo,
                    exitoso,
                    mensaje,
                    usuario_registra,
                    fecha_registro
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, now()
                );
                `,
                [
                    datos.id_empresa ?? null,
                    datos.empresa_codigo ?? null,
                    datos.nombre_base,
                    datos.paso,
                    datos.archivo ?? null,
                    datos.exitoso,
                    datos.mensaje ?? null,
                    datos.usuario_registra ?? null
                ]
            );
        } catch (error) {
            console.log('No se pudo registrar log de inicialización BD:', error);
        }
    }

    public async CrearBaseDatos(req: Request, res: Response) {
        let clienteAdmin;
        let nombreBaseLog = '';

        const idEmpresa = this.ObtenerIdEmpresa(req);
        const empresaCodigo = this.ObtenerEmpresaCodigo(req);
        const usuarioRegistra = this.ObtenerUsuarioRegistra(req);

        try {
            const nombreBase = this.LimpiarNombreBase(req.body.nombre_base);
            nombreBaseLog = nombreBase;

            clienteAdmin = CrearClientePostgresAdmin();
            await clienteAdmin.connect();

            const existeBase = await clienteAdmin.query(
                `
                SELECT 1
                FROM pg_database
                WHERE datname = $1;
                `,
                [nombreBase]
            );

            if ((existeBase.rowCount ?? 0) > 0) {
                await this.RegistrarLogInicializacion({
                    id_empresa: idEmpresa,
                    empresa_codigo: empresaCodigo,
                    nombre_base: nombreBase,
                    paso: 'CREAR_BASE',
                    archivo: null,
                    exitoso: false,
                    mensaje: 'La base de datos ya existe.',
                    usuario_registra: usuarioRegistra
                });

                return res.status(400).jsonp({
                    message: 'La base de datos ya existe.'
                });
            }

            const nombreBaseSql = this.EscaparIdentificadorPostgres(nombreBase);

            await clienteAdmin.query(`CREATE DATABASE ${nombreBaseSql};`);

            await this.RegistrarLogInicializacion({
                id_empresa: idEmpresa,
                empresa_codigo: empresaCodigo,
                nombre_base: nombreBase,
                paso: 'CREAR_BASE',
                archivo: null,
                exitoso: true,
                mensaje: 'Base de datos creada correctamente.',
                usuario_registra: usuarioRegistra
            });

            return res.jsonp({
                message: 'Base de datos creada correctamente.',
                data: {
                    nombre_base: nombreBase
                }
            });

        } catch (error: any) {
            console.log('Error al crear base de datos:', error);

            if (nombreBaseLog) {
                await this.RegistrarLogInicializacion({
                    id_empresa: idEmpresa,
                    empresa_codigo: empresaCodigo,
                    nombre_base: nombreBaseLog,
                    paso: 'CREAR_BASE',
                    archivo: null,
                    exitoso: false,
                    mensaje: error?.message ?? 'No se pudo crear la base de datos.',
                    usuario_registra: usuarioRegistra
                });
            }

            return res.status(500).jsonp({
                message: error?.message ?? 'No se pudo crear la base de datos.'
            });

        } finally {
            if (clienteAdmin) {
                await clienteAdmin.end();
            }
        }
    }

    private async EjecutarArchivoSql(nombreBase: string, rutaArchivo: string): Promise<void> {
        const sql = await fs.readFile(rutaArchivo, 'utf8');

        const cliente = CrearClientePostgresBase(nombreBase);
        await cliente.connect();

        try {
            await cliente.query(sql);
        } finally {
            await cliente.end();
        }
    }

    public async EjecutarScriptsInicializacion(req: Request, res: Response) {
        const archivos = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const idEmpresa = this.ObtenerIdEmpresa(req);
        const empresaCodigo = this.ObtenerEmpresaCodigo(req);
        const usuarioRegistra = this.ObtenerUsuarioRegistra(req);

        try {
            const nombreBase = this.LimpiarNombreBase(req.body.nombre_base);

            const scriptTablas = archivos?.script_tablas?.[0];
            const scriptVistas = archivos?.script_vistas?.[0];
            const scriptDatos = archivos?.script_datos_iniciales?.[0];

            if (!scriptTablas || !scriptVistas || !scriptDatos) {
                return res.status(400).jsonp({
                    message: 'Debe cargar los scripts de tablas, vistas y datos iniciales.'
                });
            }

            const resultado: any[] = [];

            const ejecutarPaso = async (
                paso: Exclude<PasoInicializacionBd, 'CREAR_BASE'>,
                archivo: Express.Multer.File
            ) => {
                try {
                    await this.EjecutarArchivoSql(nombreBase, archivo.path);

                    await this.RegistrarLogInicializacion({
                        id_empresa: idEmpresa,
                        empresa_codigo: empresaCodigo,
                        nombre_base: nombreBase,
                        paso,
                        archivo: archivo.originalname,
                        exitoso: true,
                        mensaje: 'Script ejecutado correctamente.',
                        usuario_registra: usuarioRegistra
                    });

                    resultado.push({
                        paso,
                        archivo: archivo.originalname,
                        exitoso: true
                    });

                } catch (error: any) {
                    await this.RegistrarLogInicializacion({
                        id_empresa: idEmpresa,
                        empresa_codigo: empresaCodigo,
                        nombre_base: nombreBase,
                        paso,
                        archivo: archivo.originalname,
                        exitoso: false,
                        mensaje: error?.message ?? 'Error al ejecutar script.',
                        usuario_registra: usuarioRegistra
                    });

                    throw error;
                }
            };

            await ejecutarPaso('TABLAS', scriptTablas);
            await ejecutarPaso('VISTAS', scriptVistas);
            await ejecutarPaso('DATOS_INICIALES', scriptDatos);

            return res.jsonp({
                message: 'Scripts ejecutados correctamente.',
                data: resultado
            });

        } catch (error: any) {
            console.log('Error al ejecutar scripts:', error);

            return res.status(500).jsonp({
                message: error?.message ?? 'No se pudieron ejecutar los scripts.'
            });

        } finally {
            await this.EliminarArchivosTemporales(archivos);
        }
    }

    public async ObtenerHistorialInicializacion(req: Request, res: Response) {
        try {
            const idEmpresa = Number(req.params.id_empresa);

            if (!idEmpresa) {
                return res.status(400).jsonp({
                    message: 'El id de empresa no es válido.'
                });
            }

            const resultado = await pool.query(
                `
                SELECT
                    id_log,
                    id_empresa,
                    empresa_codigo,
                    nombre_base,
                    paso,
                    archivo,
                    exitoso,
                    mensaje,
                    usuario_registra,
                    fecha_registro
                FROM public.empresa_inicializacion_bd_log
                WHERE id_empresa = $1
                ORDER BY fecha_registro DESC, id_log DESC;
                `,
                [idEmpresa]
            );

            return res.jsonp(resultado.rows);

        } catch (error) {
            console.log('Error al obtener historial de inicialización BD:', error);

            return res.status(500).jsonp({
                message: 'No se pudo obtener el historial de inicialización.'
            });
        }
    }

    private async EliminarArchivosTemporales(archivos?: {
        [fieldname: string]: Express.Multer.File[];
    }): Promise<void> {
        try {
            if (!archivos) {
                return;
            }

            const archivosSubidos = Object.values(archivos).flat();

            for (const archivo of archivosSubidos) {
                if (!archivo?.path) {
                    continue;
                }

                try {
                    await fs.unlink(archivo.path);
                } catch (error: any) {
                    if (error?.code !== 'ENOENT') {
                        console.log('No se pudo eliminar archivo temporal:', archivo.path, error);
                    }
                }
            }
        } catch (error) {
            console.log('Error general al limpiar archivos temporales:', error);
        }
    }
}

export const inicializacionBaseDatosControlador = new InicializacionBaseDatosControlador();
export default inicializacionBaseDatosControlador;