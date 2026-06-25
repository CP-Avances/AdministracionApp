import multer from 'multer';
import path from 'path';
import fs from 'fs';

const carpetaDestino = path.join(process.cwd(), 'uploads', 'scripts-bd');

if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, carpetaDestino);
    },
    filename: (_req, file, cb) => {
        const nombreSeguro = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_.-]/g, '');

        cb(null, `${Date.now()}_${nombreSeguro}`);
    }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== '.sql') {
        return cb(new Error('Solo se permiten archivos .sql'));
    }

    cb(null, true);
};

export const UploadScriptsBd = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});