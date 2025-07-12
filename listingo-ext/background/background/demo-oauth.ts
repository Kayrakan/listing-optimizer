chrome.webRequest.onCompleted.addListener(
    (details) => {
        // your backend redirects the demo callback to:
        // plasmo-extension://<id>/demo-oauth-success.html?storeId=...&name=...&platform=...
        const url = new URL(details.url)
        if (!url.pathname.endsWith("/demo-oauth-success.html")) return

        chrome.runtime.sendMessage({
            type: "demo-oauth-success",
            storeId: url.searchParams.get("storeId"),
            storeName: url.searchParams.get("name"),
            platform: url.searchParams.get("platform")
        })
    },
    { urls: ["*://*/demo-oauth-success.html*"] }
)
