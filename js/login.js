(() => {
    const form = document.querySelector("#loginForm");
    if (!form) return;

    const usernameInput = form.querySelector(
        '[name="username"], [name="email"], #username, #email'
    );

    const passwordInput = form.querySelector(
        '[name="password"], #password'
    );

    let message = document.querySelector(
        "#loginMessage, [data-login-message]"
    );

    if (!usernameInput || !passwordInput) {
        console.error("Login form needs username and password inputs.");
        return;
    }

    if (!message) {
        message = document.createElement("p");
        message.id = "loginMessage";
        message.setAttribute("role", "alert");
        message.setAttribute("aria-live", "polite");
        form.appendChild(message);
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const button = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        const originalText = button
            ? (button.textContent || button.value)
            : "";

        if (button) {
            button.disabled = true;
            if (button.tagName === "BUTTON") {
                button.textContent = "Signing in...";
            } else {
                button.value = "Signing in...";
            }
        }

        message.textContent = "";
        message.style.color = "";

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: usernameInput.value,
                    password: passwordInput.value
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                message.textContent =
                    result.error ||
                    "We couldn't sign you in with those details.";
                return;
            }

            window.location.assign("/dashboard.html");
        } catch {
            message.textContent =
                "Unable to contact the sign-in service. Please try again.";
        } finally {
            if (button) {
                button.disabled = false;

                if (button.tagName === "BUTTON") {
                    button.textContent = originalText;
                } else {
                    button.value = originalText;
                }
            }
        }
    });
})();
