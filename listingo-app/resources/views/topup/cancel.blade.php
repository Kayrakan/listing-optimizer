<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Top-up Cancelled</title>
    <link rel="icon" href="/favicon.ico" />
    <style>body{font-family:ui-sans-serif,system-ui;max-width:720px;margin:4rem auto;padding:0 1rem}</style>
    <script>
        window.opener && window.opener.postMessage({ type: 'lemonsqueezy:cancel' }, '*')
    </script>
</head>
<body>
    <h1>Payment cancelled</h1>
    <p>No charges were made. You may close this tab.</p>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Cancelled - Listing Optimizer</title>
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
        .cancel-container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            margin-top: 50px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #dc3545;
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
        .btn-retry {
            background-color: #28a745;
        }
        .btn-retry:hover {
            background-color: #218838;
        }
    </style>
</head>
<body>
    <div class="cancel-container">
        <h1>Payment Cancelled</h1>
        <p>Your payment process was cancelled. No charges have been made to your account.</p>
        <p>If you encountered any issues during the payment process, please contact our support team.</p>
        <div>
            <a href="/" class="btn">Return to Home</a>
            <a href="/" class="btn btn-retry">Try Again</a>
        </div>
    </div>
</body>
</html>
