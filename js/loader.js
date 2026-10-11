(() => {
    "use strict";

    if (window.__bramptonLoaderInitialised) return;
    window.__bramptonLoaderInitialised = true;

    const style = document.createElement("style");
    style.textContent = `
        #pageLoader {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 18px;
            background: #f5f7fa;
            opacity: 1;
            visibility: visible;
            transition: opacity .2s ease, visibility .2s ease;
        }

        #pageLoader.loader-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        #pageLoader .oval-loader {
            width: 46px;
            height: 46px;
            border: 4px solid #dce5ef;
            border-top-color: #335882;
            border-radius: 50%;
            animation: bramptonSpin .75s linear infinite;
        }

        #pageLoader .loader-text {
            color: #335882;
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: .2px;
        }

        @keyframes bramptonSpin {
            to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
            #pageLoader .oval-loader {
                animation-duration: 1.8s;
            }
        }
    `;
    document.head.appendChild(style);

    let loader = document.getElementById("pageLoader");

    if (!loader) {
        loader = document.createElement("div");
        loader.id = "pageLoader";
        loader.setAttribute("role", "status");
        loader.setAttribute("aria-live", "polite");
        loader.innerHTML = `
            <div class="oval-loader" aria-hidden="true"></div>
            <div class="loader-text">Loading Brampton Develop...</div>
        `;
        document.body.prepend(loader);
    }

    let hideTimer;

    window.showLoader = function (message = "Loading Brampton Develop...") {
        clearTimeout(hideTimer);

        const text = loader.querySelector(".loader-text");
        if (text) text.textContent = message;

        loader.classList.remove("loader-hidden");
    };

    window.hideLoader = function () {
        loader.classList.add("loader-hidden");
    };

    function finishLoading() {
        hideTimer = setTimeout(window.hideLoader, 150);
    }

    if (document.readyState === "complete") {
        finishLoading();
    } else {
        window.addEventListener("load", finishLoading, { once: true });
    }

    document.addEventListener("click", event => {
        const link = event.target.closest("a[href]");
        if (!link || event.defaultPrevented ||
            event.button !== 0 ||
            event.ctrlKey || event.metaKey ||
            event.shiftKey || event.altKey ||
            link.target === "_blank" ||
            link.hasAttribute("download")) return;

        let destination;

        try {
            destination = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        if (destination.origin !== window.location.origin ||
            !/\.html?$/i.test(destination.pathname) ||
            destination.href === window.location.href) return;

        window.showLoader("Opening page...");
    });
})();
