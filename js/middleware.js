export async function onRequest(context) {
    const response = await context.next();

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
        return response;
    }

    return new HTMLRewriter()
        .on("head", {
            element(element) {
                element.append(
                    '<link rel="icon" type="image/png" href="/assets/icon1.png">' +
                    '<link rel="apple-touch-icon" href="/assets/icon1.png">',
                    { html: true }
                );
            }
        })
        .transform(response);
}
