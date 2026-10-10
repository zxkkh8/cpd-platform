(() => {
    "use strict";

    const client =
        window.supabaseClient ||
        (typeof supabaseClient !== "undefined" ? supabaseClient : null);

    const list = document.getElementById("certificateList");
    const search = document.getElementById("certificateSearch");
    const overlay = document.getElementById("loadingOverlay");
    const loadingText = document.getElementById("loadingText");
    const modal = document.getElementById("deleteModal");
    const adminCode = document.getElementById("adminCode");
    const confirmButton = document.getElementById("confirmDelete");
    const cancelButton = document.getElementById("cancelDelete");
    const notice = document.getElementById("notice");

    let certificates = [];
    let selectedCertificate = null;
    let deleting = false;

    function showLoading(message = "Please wait...") {
        loadingText.textContent = message;
        overlay.classList.add("active");
    }

    function hideLoading() {
        overlay.classList.remove("active");
    }

    function showNotice(message, type = "error") {
        notice.textContent = message;
        notice.className = `notice ${type}`;
    }

    function clearNotice() {
        notice.textContent = "";
        notice.className = "notice";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    async function invokeManager(body) {
        if (!client) {
            throw new Error(
                "Supabase client not found. Check js/config.js and js/supabase.js."
            );
        }

        const { data, error } = await client.functions.invoke(
            "manage-certificates",
            { body }
        );

        if (error) {
            throw new Error(
                data?.error || error.message || "The request failed."
            );
        }

        if (data?.error) {
            throw new Error(data.error);
        }

        return data;
    }

    function renderCertificates() {
        const term = search.value.trim().toLowerCase();

        const filtered = certificates.filter(certificate =>
            [
                certificate.certificate_id,
                certificate.username,
                certificate.course,
                certificate.issued_at
            ].some(value =>
                String(value ?? "").toLowerCase().includes(term)
            )
        );

        if (!filtered.length) {
            list.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        ${term
                            ? "No certificates match your search."
                            : "No certificates have been issued yet."}
                    </td>
                </tr>
            `;
            return;
        }

        list.innerHTML = filtered.map(certificate => {
            const date = certificate.issued_at
                ? new Date(certificate.issued_at).toLocaleDateString("en-GB")
                : "—";

            return `
                <tr>
                    <td class="certificate-id">
                        ${escapeHTML(certificate.certificate_id || "—")}
                    </td>
                    <td>${escapeHTML(certificate.username || "—")}</td>
                    <td class="course-name">
                        ${escapeHTML(certificate.course || "—")}
                    </td>
                    <td class="muted">${escapeHTML(date)}</td>
                    <td>
                        <button
                            class="delete-btn"
                            type="button"
                            data-delete-id="${escapeHTML(certificate.id)}"
                            aria-label="Delete certificate ${escapeHTML(certificate.certificate_id || "")}"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    async function loadCertificates() {
        clearNotice();
        showLoading("Loading certificates...");

        try {
            const data = await invokeManager({ action: "list" });

            if (!Array.isArray(data.certificates)) {
                throw new Error(
                    "Unexpected response. Check the manage-certificates Edge Function."
                );
            }

            certificates = data.certificates;
            renderCertificates();
        } catch (error) {
            list.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        Unable to load certificates.
                    </td>
                </tr>
            `;

            showNotice(
                error.message || "Failed to load certificates."
            );
        } finally {
            hideLoading();
        }
    }

    function openDeleteModal(certificate) {
        selectedCertificate = certificate;
        adminCode.value = "";
        clearNotice();

        modal.classList.add("active");
        adminCode.focus();
    }

    function closeDeleteModal() {
        if (deleting) return;

        modal.classList.remove("active");
        adminCode.value = "";
        selectedCertificate = null;
        clearNotice();
    }

    list.addEventListener("click", event => {
        const button = event.target.closest("[data-delete-id]");

        if (!button) return;

        const certificate = certificates.find(
            item => String(item.id) === button.dataset.deleteId
        );

        if (certificate) {
            openDeleteModal(certificate);
        }
    });

    search.addEventListener("input", renderCertificates);

    cancelButton.addEventListener("click", closeDeleteModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeDeleteModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            closeDeleteModal();
        }

        if (
            event.key === "Enter" &&
            modal.classList.contains("active") &&
            document.activeElement === adminCode
        ) {
            confirmButton.click();
        }
    });

    confirmButton.addEventListener("click", async () => {
        if (!selectedCertificate || deleting) return;

        const code = adminCode.value.trim();

        if (!code) {
            showNotice("Enter the administrator deletion code.");
            adminCode.focus();
            return;
        }

        deleting = true;
        confirmButton.disabled = true;
        cancelButton.disabled = true;
        confirmButton.textContent = "Deleting...";

        showLoading("Deleting certificate...");
        clearNotice();

        try {
            await invokeManager({
                action: "delete",
                id: selectedCertificate.id,
                adminCode: code
            });

            certificates = certificates.filter(
                item => item.id !== selectedCertificate.id
            );

            modal.classList.remove("active");
            adminCode.value = "";
            selectedCertificate = null;

            renderCertificates();
            showNotice(
                "Certificate deleted successfully.",
                "success"
            );
        } catch (error) {
            showNotice(
                error.message || "Unable to delete certificate."
            );
        } finally {
            hideLoading();

            deleting = false;
            confirmButton.disabled = false;
            cancelButton.disabled = false;
            confirmButton.textContent = "Delete certificate";
        }
    });

    if (
        !list ||
        !search ||
        !overlay ||
        !loadingText ||
        !modal ||
        !adminCode ||
        !confirmButton ||
        !cancelButton ||
        !notice
    ) {
        console.error(
            "Certificates page is missing one or more required HTML elements."
        );
        return;
    }

    loadCertificates();
})();
