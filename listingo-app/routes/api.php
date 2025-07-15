<?php

use App\Http\Controllers\QuotaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;
use App\Http\Controllers\StripeWebhookController;

// run:  composer require firebase/php-jwt


Route::post('/auth/guest', function () {
    $user = \App\Models\User::create([
        'email'    => 'guest-'.Str::uuid().'@guest.local',
        'password' => Hash::make(Str::random(16)),
        'plan'     => 'guest',
        'quota_remaining' => 10,
    ]);

    $payload = [
        'sub'  => $user->uuid,          // use uuid claim
        'plan' => 'guest',
        'exp'  => now()->addDays(30)->timestamp,
    ];

    return response()->json([
        'token' => \Firebase\JWT\JWT::encode($payload, env('JWT_SECRET'), 'HS256')
    ]);
});



Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);


Route::middleware('supabase')->get('/quota', [QuotaController::class, 'show']);


Route::post('/checkout/create', [CheckoutController::class, 'create'])
    ->middleware('auth:api');        // optional – guests can call too

// listingo-app/routes/api.php
Route::post('/topup/session',  [TopUpController::class, 'createSession']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

