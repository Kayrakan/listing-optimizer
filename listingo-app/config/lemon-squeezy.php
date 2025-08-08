<?php

return [
    'api_key' => env('LEMONSQUEEZY_API_KEY', ''),
    'signing_secret' => env('LEMONSQUEEZY_SIGNING_SECRET', ''),
    'store_id' => env('LEMONSQUEEZY_STORE_ID', ''),
    'variant_id' => env('LEMONSQUEEZY_VARIANT_ID', ''),
    // Optional defaults
    'redirect_url' => env('LEMONSQUEEZY_REDIRECT_URL', env('APP_URL').'/topup/success'),
    'currency_locale' => env('LEMONSQUEEZY_CURRENCY_LOCALE', 'en_US'),
];
