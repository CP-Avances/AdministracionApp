import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from "crypto";
import argon2 from "argon2";

const frasecontrasenia = process.env.FRASE_CONTRASENIA ?? "";
const salcontrasenia = process.env.SAL_CONTRASENIA ?? "";

class CryptoService {
    private readonly keyGeneral: Buffer;

    constructor() {
        if (!frasecontrasenia || !salcontrasenia) {
            throw new Error("FRASE_CONTRASENIA y SAL_CONTRASENIA son obligatorias");
        }

        // 32 bytes = AES-256
        this.keyGeneral = pbkdf2Sync(frasecontrasenia, salcontrasenia, 100_000, 32, "sha256");
    }

    /* =========================
       CIFRADO REVERSIBLE (AES-GCM)
       ========================= */

    private encryptAesGcm(plain: string, key: Buffer): string {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", key, iv);

        const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // iv:tag:data
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
    }

    private decryptAesGcm(ciphertext: string, key: Buffer): string {
        const parts = ciphertext.split(":");
        if (parts.length !== 3) throw new Error("Formato de datos cifrados inválido");

        const [ivHex, tagHex, dataHex] = parts;
        if (!ivHex || !tagHex || !dataHex) throw new Error("Datos cifrados incompletos");

        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");
        const encrypted = Buffer.from(dataHex, "hex");

        const decipher = createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString("utf8");
    }

    // Datos generales (reversibles)
    public encriptarDatos(valor: string): string {
        return this.encryptAesGcm(valor, this.keyGeneral);
    }

    public desencriptarDatos(valorEncriptado: string): string {
        return this.decryptAesGcm(valorEncriptado, this.keyGeneral);
    }

    /* =========================
       CONTRASEÑAS (NO reversible)
       ========================= */

    public async hashLogin(passwordPlano: string): Promise<string> {
        return argon2.hash(passwordPlano, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
    }

    public async verificarLogin(passwordPlano: string, hashBD: string): Promise<boolean> {
        return argon2.verify(hashBD, passwordPlano);
    }

}

export const FUNCIONES_LLAVES = new CryptoService();
export default FUNCIONES_LLAVES;
