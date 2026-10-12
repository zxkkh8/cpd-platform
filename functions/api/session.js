import {
    json,
    getSession
} from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {

    try {

        const session =
            await getSession(
                request,
                env
            );

        if (!session) {
            return json(
                {
                    authenticated: false
                },
                401
            );
        }

        return json({
            authenticated: true,
            profile: session.profile
        });

    } catch (error) {

        console.error(
            "Session lookup failed:",
            error
        );

        return json(
            {
                authenticated: false
            },
            500
        );
    }
}
