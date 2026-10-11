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

    // Only allow public pages at the website root.
    const script = document.querySelector(
        "script[data-master-auth-guard]"
    );

    if (!script) {
        document.documentElement.style.visibility = "visible";
        console.error("Master authentication guard script not found.");
        return;
    }

    const scriptUrl = new URL(script.src);
    const siteRoot = new URL("../", scriptUrl);
    const loginUrl = new URL("index.html", siteRoot).href;

    const pagePath = path.replace(/\/+$/, "") || "/";

    if (publicPages.includes(pagePath)) {
        return;
    }

    document.documentElement.style.visibility = "hidden";

    function showError() {
        document.documentElement.style.visibility = "visible";

        document.body.innerHTML = `
            <main style="
                font-family: Arial, sans-serif;
                max-width: 500px;
                margin: 100px auto;
                padding: 24px;
                text-align: center;
            ">
                <h2>Unable to verify your login</h2>
                <p>Please check your connection and try again.</p>
                <a href="${loginUrl}">Return to login</a>
            </main>
        `;
    }

    try {
        const client = window.supabaseClient;

        if (!client?.auth?.getUser) {
            throw new Error(
                "Supabase client is unavailable. Check config.js and supabase.js."
            );
        }

        const { data, error } = await client.auth.getUser();

        if (error || !data?.user) {
            window.location.replace(loginUrl);
            return;
        }

        document.documentElement.style.visibility = "visible";

        client.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                window.location.replace(loginUrl);
            }
        });
    } catch (error) {
        console.error("Authentication guard:", error);
        showError();
    }
})();
