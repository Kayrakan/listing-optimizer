<?php

use App\Http\Controllers\QuotaController;
use App\Http\Controllers\TopUpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;
use App\Http\Controllers\LemonSqueezyWebhookController;

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



Route::post('/lemonsqueezy/webhook', [LemonSqueezyWebhookController::class, 'handle']);


Route::middleware('supabase')->get('/quota', [QuotaController::class, 'show']);


// Route removed as we're using TopUpController for payments

// listingo-app/routes/api.php
Route::post('/topup/session',  [TopUpController::class, 'createSession']);
