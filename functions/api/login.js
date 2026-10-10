import {
    jsonResponse,
    rejectOrigin,
    setSessionCookie,
    hashPassword,
    verifyPassword,
    hashSessionToken,
    createSessionToken,
    dbRequest,
    getProfile,
    SESSION_SECONDS
} from "../_lib/auth.js";

const DUMMY_SALT = "MDAwMDAwMDAwMDAwMDAwMA==";
const DUMMY_HASH = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export async function onRequestPost({ request, env }) {
    const rejected = rejectOrigin(request);
    if (rejected) return rejected;

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
        return jsonResponse({ error: "Invalid request." }, 415);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 10000) {
        return jsonResponse({ error: "Request too large." }, 413);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: "Invalid request." }, 400);
    }

    const username = typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const password = typeof body.password === "string"
        ? body.password
        : "";

    if (
        !username ||
        username.length > 254 ||
        !username.includes("@") ||
        !password ||
        password.length > 1024
    ) {
        return jsonResponse(
            { error: "We couldn't sign you in with those details." },
            401
        );
    }

    try {
        const query = new URLSearchParams({
            select: "username,profile_id,password_hash,salt,iterations,is_enabled",
            username: `eq.${username}`,
            limit: "1"
        });

        const rows = await dbRequest(
            env,
            `custom_login_credentials?${query.toString()}`
        );

        const credential = Array.isArray(rows) ? rows[0] : null;

        // Perform a dummy hash for unknown usernames to reduce
        // username-enumeration timing differences.
        if (!credential) {
            await hashPassword(password, DUMMY_SALT, 600000);

            return jsonResponse(
                { error: "We couldn't sign you in with those details." },
                401
            );
        }

        if (!credential.is_enabled) {
            await hashPassword(password, DUMMY_SALT, 600000);

            return jsonResponse(
                { error: "We couldn't sign you in with those details." },
                401
            );
        }

        const valid = await verifyPassword(
            password,
            credential.password_hash,
            credential.salt,
            credential.iterations
        );

        if (!valid) {
            return jsonResponse(
                { error: "We couldn't sign you in with those details." },
                401
            );
        }

        const profile = await getProfile(env, credential.profile_id);

        if (!profile || profile.is_active !== true) {
            return jsonResponse(
                { error: "This account is inactive. Contact an administrator." },
                403
            );
        }

        const token = createSessionToken();
        const tokenHash = await hashSessionToken(token);
        const expiresAt = new Date(
            Date.now() + SESSION_SECONDS * 1000
        ).toISOString();

        await dbRequest(
            env,
            "custom_login_sessions",
            {
                method: "POST",
                headers: { "Prefer": "return=minimal" },
                body: JSON.stringify({
                    token_hash: tokenHash,
                    profile_id: profile.id,
                    expires_at: expiresAt
                })
            }
        );

        return jsonResponse(
            {
                success: true,
                profile: {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    role: profile.role
                }
            },
            200,
            {
                "Set-Cookie": `__Host-brampton_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`
            }
        );
    } catch {
        return jsonResponse(
            { error: "The sign-in service is temporarily unavailable." },
            500
        );
    }
}
