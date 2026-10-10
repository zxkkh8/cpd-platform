import {
    jsonResponse,
    getSessionToken,
    hashSessionToken,
    getProfile,
    dbRequest,
    removeSession,
    clearSessionCookie
} from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
    const token = getSessionToken(request);

    if (!token) {
        return jsonResponse({ authenticated: false }, 401);
    }

    try {
        const tokenHash = await hashSessionToken(token);

        const query = new URLSearchParams({
            select: "token_hash,profile_id,expires_at",
            token_hash: `eq.${tokenHash}`,
            expires_at: `gt.${new Date().toISOString()}`,
            limit: "1"
        });

        const rows = await dbRequest(
            env,
            `custom_login_sessions?${query.toString()}`
        );

        const session = Array.isArray(rows) ? rows[0] : null;

        if (!session) {
            return jsonResponse(
                { authenticated: false },
                401,
                clearSessionCookie()
            );
        }

        const profile = await getProfile(env, session.profile_id);

        if (!profile || profile.is_active !== true) {
            await removeSession(env, tokenHash);

            return jsonResponse(
                { authenticated: false },
                401,
                clearSessionCookie()
            );
        }

        return jsonResponse({
            authenticated: true,
            profile: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role
            }
        });
    } catch {
        return jsonResponse(
            { error: "Unable to verify your session." },
            500
        );
    }
}
