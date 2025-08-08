<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Top-up Success</title>
    <link rel="icon" href="/favicon.ico" />
    <style>body{font-family:ui-sans-serif,system-ui;max-width:720px;margin:4rem auto;padding:0 1rem}</style>
    <script>
        // Notify extension via postMessage so it can close the tab
        window.opener && window.opener.postMessage({ type: 'lemonsqueezy:success' }, '*')
    </script>
    <script>
        // redirect back to extension's return url if provided as query
        const params = new URLSearchParams(location.search)
        const r = params.get('return')
        if (r) location.href = r
    </script>
    </head>
<body>
    <h1>Payment successful</h1>
    <p>Your credits will be available momentarily. You may close this tab.</p>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Listing Optimizer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        .success-container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            margin-top: 50px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #28a745;
            margin-bottom: 20px;
        }
        p {
            font-size: 18px;
            margin-bottom: 15px;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="success-container">
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your credits have been added to your account.</p>
        <p>You can now continue using Listing Optimizer with your new credits.</p>
        <p>If you have any questions, please contact our support team.</p>
        <a href="/" class="btn">Return to Home</a>
    </div>
</body>
</html>
