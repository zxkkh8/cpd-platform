import {
    jsonResponse,
    rejectOrigin,
    getSessionToken,
    hashSessionToken,
    removeSession,
    clearSessionCookie
} from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
    const rejected = rejectOrigin(request);
    if (rejected) return rejected;

    const token = getSessionToken(request);

    try {
        if (token) {
            const tokenHash = await hashSessionToken(token);
            await removeSession(env, tokenHash);
        }

        return jsonResponse(
            { success: true },
            200,
            clearSessionCookie()
        );
    } catch {
        return jsonResponse(
            { error: "Unable to log out. Please try again." },
            500,
            clearSessionCookie()
        );
    }
}
