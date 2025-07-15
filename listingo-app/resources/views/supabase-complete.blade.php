<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing you in…</title></head>
<body>
<script type="module">
    /* 1️⃣  bring the shared supabase client (built by Vite/Laravel Mix) */
    import { supabase } from '{{ mix('/js/supabase.js') }}'

    /* 2️⃣  this reads the #access_token from URL, sets sb-* cookie */
    await supabase.auth.getSession()

    /* 3️⃣  optional: fetch current credit balance */
    let credits
    try {
        const { data } = await supabase.from('users').select('credits').single()
        credits = data?.credits
    } catch (_) {}

    /* 4️⃣  tell the extension everything is ready */
    chrome?.runtime?.sendMessage?.({ type: 'supabase-sign-in', credits })

    /* 5️⃣  small UX nicety */
    window.close()
</script>
<p style="font-family:system-ui">Redirecting… You may close this tab.</p>
</body>
</html>
