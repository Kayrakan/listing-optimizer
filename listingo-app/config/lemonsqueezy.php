<?php

return [
    /*
    |--------------------------------------------------------------------------
    | LemonSqueezy API Key
    |--------------------------------------------------------------------------
    |
    | The LemonSqueezy API key is used to authenticate with the LemonSqueezy API.
    | You can find your API key in your LemonSqueezy dashboard under Settings > API.
    |
    */

    'api_key' => env('LEMONSQUEEZY_API_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | LemonSqueezy Signing Secret
    |--------------------------------------------------------------------------
    |
    | The LemonSqueezy signing secret is used to verify webhook requests from
    | LemonSqueezy. You can find your signing secret in your LemonSqueezy
    | dashboard under Settings > Webhooks.
    |
    */

    'signing_secret' => env('LEMONSQUEEZY_SIGNING_SECRET', ''),

    /*
    |--------------------------------------------------------------------------
    | LemonSqueezy Store ID
    |--------------------------------------------------------------------------
    |
    | The LemonSqueezy store ID is used to identify your store when creating
    | checkout sessions. You can find your store ID in your LemonSqueezy
    | dashboard under Settings > General.
    |
    */

    'store_id' => env('LEMONSQUEEZY_STORE_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | LemonSqueezy Variant ID
    |--------------------------------------------------------------------------
    |
    | The LemonSqueezy variant ID is used to identify the product variant when
    | creating checkout sessions. You can find your variant ID in your
    | LemonSqueezy dashboard under Products > [Your Product] > Variants.
    |
    */

    'variant_id' => env('LEMONSQUEEZY_VARIANT_ID', ''),
];
