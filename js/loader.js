(() => {
    const loader = document.getElementById("loading");

    if (!loader) return;

    window.showLoader = (message = "Loading...") => {
        const text = loader.querySelector(".loading-text");
        if (text) text.textContent = message;

        loader.classList.remove("hidden");
    };

    window.hideLoader = () => {
        loader.classList.add("hidden");
    };

    // Hide when the page has finished loading.
    window.addEventListener("load", () => {
        window.hideLoader();
    });

    // Show the loader when navigating to another local HTML page.
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
})();
