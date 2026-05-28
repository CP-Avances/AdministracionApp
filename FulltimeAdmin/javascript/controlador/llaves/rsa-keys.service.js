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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNCIONES_LLAVES = void 0;
const crypto_1 = require("crypto");
const argon2_1 = __importDefault(require("argon2"));
const frasecontrasenia = (_a = process.env.FRASE_CONTRASENIA) !== null && _a !== void 0 ? _a : "";
const salcontrasenia = (_b = process.env.SAL_CONTRASENIA) !== null && _b !== void 0 ? _b : "";
class CryptoService {
    constructor() {
        if (!frasecontrasenia || !salcontrasenia) {
            throw new Error("FRASE_CONTRASENIA y SAL_CONTRASENIA son obligatorias");
        }
        // 32 bytes = AES-256
        this.keyGeneral = (0, crypto_1.pbkdf2Sync)(frasecontrasenia, salcontrasenia, 100000, 32, "sha256");
    }
    /* =========================
       CIFRADO REVERSIBLE (AES-GCM)
       ========================= */
    encryptAesGcm(plain, key) {
        const iv = (0, crypto_1.randomBytes)(12);
        const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", key, iv);
        const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // iv:tag:data
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
    }
    decryptAesGcm(ciphertext, key) {
        const parts = ciphertext.split(":");
        if (parts.length !== 3)
            throw new Error("Formato de datos cifrados inválido");
        const [ivHex, tagHex, dataHex] = parts;
        if (!ivHex || !tagHex || !dataHex)
            throw new Error("Datos cifrados incompletos");
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");
        const encrypted = Buffer.from(dataHex, "hex");
        const decipher = (0, crypto_1.createDecipheriv)("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString("utf8");
    }
    // Datos generales (reversibles)
    encriptarDatos(valor) {
        return this.encryptAesGcm(valor, this.keyGeneral);
    }
    desencriptarDatos(valorEncriptado) {
        return this.decryptAesGcm(valorEncriptado, this.keyGeneral);
    }
    /* =========================
       CONTRASEÑAS (NO reversible)
       ========================= */
    hashLogin(passwordPlano) {
        return __awaiter(this, void 0, void 0, function* () {
            return argon2_1.default.hash(passwordPlano, {
                type: argon2_1.default.argon2id,
                memoryCost: Math.pow(2, 16),
                timeCost: 3,
                parallelism: 1
            });
        });
    }
    verificarLogin(passwordPlano, hashBD) {
        return __awaiter(this, void 0, void 0, function* () {
            return argon2_1.default.verify(hashBD, passwordPlano);
        });
    }
}
exports.FUNCIONES_LLAVES = new CryptoService();
exports.default = exports.FUNCIONES_LLAVES;
