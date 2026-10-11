
(function () {
    "use strict";

    const PUBLIC_PAGES = [
        "/",
        "/index.html",
        "/forgot-password.html",
        "/forgotten-password.html",
        "/status.html",
        "/404.html"
    ];

    const path = window.location.pathname;
    const pageName = path.split("/").pop().toLowerCase();

    if (
        path === "/" ||
        PUBLIC_PAGES.some(page => path.toLowerCase().endsWith(page)) ||
        pageName === ""
    ) {
        return;
    }

    // Hide protected content until Supabase verifies the session.
    document.documentElement.style.visibility = "hidden";

    let finished = false;

    function redirectToLogin() {
        if (finished) return;
        finished = true;

        const loginUrl = new URL("index.html", window.location.href);
        window.location.replace(loginUrl.href);
    }

    function showError() {
        if (finished) return;
        finished = true;

        document.documentElement.style.visibility = "visible";

        document.body.replaceChildren();

        const main = document.createElement("main");
        main.style.cssText =
            "font-family:Arial,sans-serif;max-width:480px;" +
            "margin:100px auto;padding:24px;text-align:center";

        const heading = document.createElement("h2");
        heading.textContent = "Unable to verify your session";

        const message = document.createElement("p");
        message.textContent =
            "Please check your connection and try again.";

        const retry = document.createElement("button");
        retry.textContent = "Try again";
        retry.style.cssText = "padding:10px 18px;cursor:pointer";
        retry.onclick = () => window.location.reload();

        const link = document.createElement("a");
        link.href = new URL("index.html", window.location.href).href;
        link.textContent = " Return to login";

        main.append(heading, message, retry, document.createElement("br"), link);
        document.body.appendChild(main);
    }

    async function protectPage() {
        try {
            const client = window.supabaseClient;

            if (!client || !client.auth) {
                throw new Error(
                    "Supabase client is missing. Check script loading order."
                );
            }

            const { data, error } = await client.auth.getUser();

            if (error || !data || !data.user) {
                redirectToLogin();
                return;
            }

            if (finished) return;
            finished = true;

            document.documentElement.style.visibility = "visible";

            client.auth.onAuthStateChange((event) => {
                if (event === "SIGNED_OUT") {
                    window.location.replace(
                        new URL("index.html", window.location.href).href
                    );
                }
            });
        } catch (error) {
            console.error("Auth guard error:", error);
            showError();
        }
    }

    protectPage();
})();
