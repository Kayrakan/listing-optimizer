chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'supabase-sign-in') {
        // fan-out so any open popup reacts
        chrome.runtime.sendMessage(msg)
    }
})
