import { getSession } from "./_lib/auth.js";

const PUBLIC_PATHS = [
    "/",
    "/index.html",
    "/forgot-password.html",
    "/forgotten-password.html",
    "/status.html",
    "/404.html",

    "/api/login",
    "/api/logout",
    "/api/session",

    "/assets/",
    "/js/",
    "/favicon.ico",
    "/manifest.json"
];

export async function onRequest(context) {

    const { request, env } = context;

    const url = new URL(request.url);
    const pathname = url.pathname;

    const isPublic = PUBLIC_PATHS.some(path =>
        pathname === path ||
        pathname.startsWith(path)
    );

    if (!isPublic) {

        try {

            const session = await getSession(
                request,
                env
            );

            if (!session) {

                return Response.redirect(
                    new URL(
                        "/index.html",
                        request.url
                    ),
                    302
                );

            }

        } catch (error) {

            console.error(
                "[Middleware]",
                error
            );

            return Response.redirect(
                new URL(
                    "/index.html",
                    request.url
                ),
                302
            );

        }

    }

    const response =
        await context.next();

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    if (
        !contentType.includes(
            "text/html"
        )
    ) {
        return response;
    }

    const html =
        await response.text();

    const updatedHtml =
        html.replace(
            "</head>",
            `
/js/auth-guard.jsscript>
</head>`
        );

    return new Response(
        updatedHtml,
        {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        }
    );

}
