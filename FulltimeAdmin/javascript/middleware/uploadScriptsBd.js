"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadScriptsBd = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const carpetaDestino = path_1.default.join(process.cwd(), 'uploads', 'scripts-bd');
if (!fs_1.default.existsSync(carpetaDestino)) {
    fs_1.default.mkdirSync(carpetaDestino, { recursive: true });
}
const storage = multer_1.default.diskStorage({
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
const fileFilter = (_req, file, cb) => {
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    if (extension !== '.sql') {
        return cb(new Error('Solo se permiten archivos .sql'));
    }
    cb(null, true);
};
exports.UploadScriptsBd = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});
