
import { jwtVerify } from 'jose';

// Simple PBKDF2 implementation for Cloudflare Workers
async function pbkdf2(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "HMAC", hash: "SHA-256", length: 256 },
        true,
        ["sign", "verify"]
    );
    const exported = await crypto.subtle.exportKey("raw", key);
    return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password) {
    const salt = "global-salt-v1"; // In prod, generate random salt per user
    return await pbkdf2(password, salt);
}

export async function verifyPassword(inputPassword, storedHash) {
    const salt = "global-salt-v1";
    const inputHash = await pbkdf2(inputPassword, salt);
    return inputHash === storedHash;
}


export async function verifyToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET || 'secret-salt-dev');
        const { payload } = await jwtVerify(token, secret);
        return payload; // { sub, role, username, ... }
    } catch (e) {
        return null;
    }
}

export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}
