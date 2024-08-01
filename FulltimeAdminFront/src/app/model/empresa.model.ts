export interface EmpresaElemento {
    empresa_id: number;
    empresa_codigo: string;
    empresa_direccion: string;
    empresa_descripcion: string;
    hora_extra: boolean;
    accion_personal: boolean;
    alimentacion: boolean;
    permisos: boolean;
    geolocalizacion: boolean;
    vacaciones: boolean;
    app_movil: boolean;
    timbre_web: boolean;
    movil_direccion: string;
    movil_descripcion: string;
}