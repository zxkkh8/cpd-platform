(() => {
    "use strict";

    const LOGIN_PAGE = "index.html";
    const CHECK_TIMEOUT_MS = 10000;

    // Hide protected content while authentication is checked.
    document.documentElement.style.visibility = "hidden";

    function getSupabaseClient() {
        return (
            window.supabaseClient ||
            window.sb ||
            window.supabase ||
            null
        );
    }

    function redirectToLogin() {
        const loginUrl = new URL(LOGIN_PAGE, window.location.href);

        loginUrl.searchParams.set(
            "next",
            window.location.pathname +
            window.location.search +
            window.location.hash
        );

        window.location.replace(loginUrl.href);
    }

    function showSecurityError(message) {
        document.documentElement.style.visibility = "visible";

        document.body.innerHTML = "";

        const main = document.createElement("main");
        main.style.cssText =
            "font-family:Arial,sans-serif;max-width:480px;" +
            "margin:100px auto;padding:24px;text-align:center;";

        const heading = document.createElement("h2");
        heading.textContent = "Unable to verify your session";

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        const retry = document.createElement("button");
        retry.textContent = "Try again";
        retry.style.cssText = "padding:10px 18px;cursor:pointer;";
        retry.addEventListener("click", () => window.location.reload());

        const login = document.createElement("p");
        const link = document.createElement("a");
        link.href = LOGIN_PAGE;
        link.textContent = "Return to login";
        login.appendChild(link);

        main.append(heading, paragraph, retry, login);
        document.body.appendChild(main);
    }

    async function checkAuthentication() {
        const client = getSupabaseClient();

        if (!client || !client.auth ||
            typeof client.auth.getUser !== "function") {
            throw new Error(
                "Supabase client was not found. Check js/supabase.js " +
                "and ensure it loads before js/auth-guard.js."
            );
        }

        // Validate the user with Supabase Auth rather than trusting
        // a user object or session value stored in the browser.
        const result = await Promise.race([
            client.auth.getUser(),
            new Promise((_, reject) => {
                setTimeout(
                    () => reject(new Error("Authentication check timed out.")),
                    CHECK_TIMEOUT_MS
                );
            })
        ]);

        if (result.error) {
            throw result.error;
        }

        if (!result.data || !result.data.user) {
            redirectToLogin();
            return false;
        }

        return true;
    }

    async function protectPage() {
        try {
            const authenticated = await checkAuthentication();

            if (authenticated) {
                document.documentElement.style.visibility = "visible";
            }
        } catch (error) {
            console.error("Authentication guard:", error);

            showSecurityError(
                "Your login could not be verified. Check your connection " +
                "and Supabase configuration, then try again."
            );
        }
    }

    // Re-check the session if another part of the application signs out.
    async function monitorSession() {
        const client = getSupabaseClient();

        if (!client?.auth?.onAuthStateChange) return;

        client.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                redirectToLogin();
            }
        });
    }

    // Wait until the shared client has been initialised.
    async function start() {
        await protectPage();

        if (document.documentElement.style.visibility === "visible") {
            await monitorSession();
        }
    }

    start();
})();
