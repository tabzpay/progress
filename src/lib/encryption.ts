/**
 * Field-Level Encryption Utility (Client-Side)
 * Uses Web Crypto API for AES-GCM encryption.
 * Zero-knowledge: Data is encrypted before sending to Supabase.
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT_FIXED = new TextEncoder().encode("ProgressSafeLendingSalt"); // Fixed salt for simplified key derivation across sessions

/**
 * Derives a cryptographic key from a passphrase.
 */
export async function deriveKey(passphrase: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: SALT_FIXED,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: KEY_LEN },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts a string using AES-GCM.
 * Returns a base64 encoded string containing IV and Ciphertext.
 */
export async function encrypt(text: string, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
    );

    // Combine IV and Ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to Base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64 string using AES-GCM.
 */
export async function decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
    const dec = new TextDecoder();
    const combined = new Uint8Array(
        atob(encryptedBase64)
            .split("")
            .map((c) => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    try {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );
        return dec.decode(decrypted);
    } catch (e) {
        throw new Error("Decryption failed. Incorrect key or corrupted data.");
    }
}

/**
 * Helper to identify if a string is likely encrypted.
 * Prefixed with 'ENC:' to distinguish from plain text.
 */
export const ENC_PREFIX = "ENC_GCM:";

export function isEncrypted(text: string): boolean {
    return typeof text === 'string' && text.startsWith(ENC_PREFIX);
}

export async function secureEncrypt(text: string, key: CryptoKey | null): Promise<string> {
    if (!key || !text) return text;
    const encrypted = await encrypt(text, key);
    return `${ENC_PREFIX}${encrypted}`;
}

export async function secureDecrypt(text: string, key: CryptoKey | null): Promise<string> {
    if (!isEncrypted(text)) return text;
    if (!key) return "[Encrypted Content - Privacy Key Required]";

    try {
        const raw = text.replace(ENC_PREFIX, "");
        return await decrypt(raw, key);
    } catch (e) {
        return "[Decryption Error - Invalid Privacy Key]";
    }
}
