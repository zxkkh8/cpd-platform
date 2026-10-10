const COOKIE_NAME = "__Host-brampton_session";
const SESSION_SECONDS = 8 * 60 * 60;
const PASSWORD_ITERATIONS = 600000;

function json(body, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            ...extraHeaders
        }
    });
}

function cookieHeader(token, maxAge = SESSION_SECONDS) {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function readCookie(request) {
    const cookies = request.headers.get("Cookie") || "";

    for (const item of cookies.split(";")) {
        const separator = item.indexOf("=");
        if (separator < 0) continue;

        const name = item.slice(0, separator).trim();
        const value = item.slice(separator + 1).trim();

        if (name === COOKIE_NAME) return value;
    }

    return null;
}

function sameOrigin(request) {
    const origin = request.headers.get("Origin");

    return Boolean(origin) &&
        origin === new URL(request.url).origin;
}

function toBase64(bytes) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}

function toHex(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function jsonResponse(body, status = 200, headers = {}) {
    return json(body, status, headers);
}

export function rejectOrigin(request) {
    if (!sameOrigin(request)) {
        return json({ error: "Request rejected." }, 403);
    }

    return null;
}

export function setSessionCookie(token) {
    return { "Set-Cookie": cookieHeader(token) };
}

export function clearSessionCookie() {
    return {
        "Set-Cookie": cookieHeader("", 0)
    };
}

export function getSessionToken(request) {
    return readCookie(request);
}

export async function hashPassword(password, saltBase64, iterations = PASSWORD_ITERATIONS) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const result = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: fromBase64(saltBase64),
            iterations,
            hash: "SHA-256"
        },
        key,
        256
    );

    return toBase64(new Uint8Array(result));
}

export async function verifyPassword(password, savedHash, salt, iterations) {
    if (
        !Number.isInteger(iterations) ||
        iterations < PASSWORD_ITERATIONS ||
        iterations > 1000000
    ) {
        return false;
    }

    const actual = await hashPassword(password, salt, iterations);
    const a = fromBase64(actual);
    const b = fromBase64(savedHash);

    if (a.length !== b.length) return false;

    // Constant-work comparison for equal-length hashes.
    let difference = 0;
    for (let i = 0; i < a.length; i++) {
        difference |= a[i] ^ b[i];
    }

    return difference === 0;
}

export async function hashSessionToken(token) {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token)
    );

    return toHex(new Uint8Array(digest));
}

export function createSessionToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return toBase64(bytes)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

export async function dbRequest(env, path, options = {}) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Server database configuration is missing.");
    }

    const base = env.SUPABASE_URL
        .replace(/\/rest\/v1\/?$/, "")
        .replace(/\/+$/, "");

    const response = await fetch(`${base}/rest/v1/${path}`, {
        ...options,
        headers: {
            "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        // Do not return database errors or secrets to the browser.
        throw new Error(`Database request failed (${response.status}).`);
    }

    return data;
}

export async function getProfile(env, profileId) {
    const query = new URLSearchParams({
        select: "id,email,full_name,role,is_active",
        id: `eq.${profileId}`,
        limit: "1"
    });

    const rows = await dbRequest(
        env,
        `profiles?${query.toString()}`
    );

    return Array.isArray(rows) ? rows[0] || null : null;
}

export async function removeSession(env, tokenHash) {
    const query = new URLSearchParams({
        token_hash: `eq.${tokenHash}`
    });

    await dbRequest(
        env,
        `custom_login_sessions?${query.toString()}`,
        { method: "DELETE" }
    );
}

export { COOKIE_NAME, SESSION_SECONDS, PASSWORD_ITERATIONS, json };
