(async function () {
    "use strict";

    const path = window.location.pathname.toLowerCase();

    const publicPages = [
        "/",
        "/index.html",
        "/forgot-password.html",
        "/forgotten-password.html",
        "/status.html",
        "/404.html"
    ];

    const pagePath =
        path.replace(/\/+$/, "") || "/";

    if (publicPages.includes(pagePath)) {
        document.documentElement.style.visibility = "visible";
        return;
    }

    document.documentElement.style.visibility =
        "hidden";

    function showError() {

        document.documentElement.style.visibility =
            "visible";

        document.body.innerHTML = `
            <main style="
                font-family:Segoe UI,Arial,sans-serif;
                max-width:500px;
                margin:100px auto;
                padding:24px;
                text-align:center;
            ">
                <h2>Unable to verify your login</h2>

                <p>
                    Please sign in again to continue.
                </p>

                <a href="index.html">
                    Return to login
                </a>
            </main>
        `;
    }

    try {

        const response =
            await fetch(
                "/api/session",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            localStorage.removeItem(
                "currentUser"
            );

            window.location.replace(
                "index.html"
            );

            return;
        }

        const result =
            await response.json();

        if (
            !result ||
            result.authenticated !== true ||
            !result.profile
        ) {

            localStorage.removeItem(
                "currentUser"
            );

            window.location.replace(
                "index.html"
            );

            return;
        }

        const profile =
            result.profile;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(profile)
        );

        window.currentUser =
            profile;

        document.dispatchEvent(
            new CustomEvent(
                "authReady",
                {
                    detail: profile
                }
            )
        );

        document.documentElement.style.visibility =
            "visible";

    } catch (error) {

        console.error(
            "[Auth Guard]",
            error
        );

        localStorage.removeItem(
            "currentUser"
        );

        showError();

    }

})();
