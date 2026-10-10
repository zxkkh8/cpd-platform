
(() => {
    const loader = document.getElementById("loading");

    if (loader) {
        window.showLoader = (message = "Loading...") => {
            const text = loader.querySelector(".loading-text");
            if (text) text.textContent = message;
            loader.classList.remove("hidden");
        };

        window.hideLoader = () => {
            loader.classList.add("hidden");
        };

        window.addEventListener("load", () => {
            window.hideLoader();
        });

        document.addEventListener("click", (event) => {
            const link = event.target.closest("a");

            if (
                !link ||
                event.defaultPrevented ||
                event.button !== 0 ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey ||
                link.target === "_blank" ||
                link.hasAttribute("download")
            ) return;

            const url = new URL(link.href, location.href);

            if (
                url.origin === location.origin &&
                url.pathname.endsWith(".html") &&
                url.href !== location.href
            ) {
                window.showLoader();
            }
        });
    }

    // Initialise Supabase using config.js
    if (!window.APP?.supabase) {
        console.error("[Brampton Develop] config.js has not loaded.");
        return;
    }

    if (!window.supabase?.createClient) {
        console.error("[Brampton Develop] Supabase library has not loaded.");
        return;
    }

    const { url, key } = window.APP.supabase;

    if (!url || !key) {
        console.error("[Brampton Develop] Supabase URL or key is missing.");
        return;
    }

    try {
        window.supabaseClient = window.supabase.createClient(
            url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, ""),
            key
        );

        console.info("[Brampton Develop] Supabase initialised.");
    } catch (error) {
        console.error("[Brampton Develop] Supabase initialisation failed:", error);
    }
})();
