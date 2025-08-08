<?php

use App\Http\Controllers\QuotaController;
use App\Http\Controllers\LemonSqueezyWebhookController;
use App\Models\User;
use App\Http\Controllers\TopUpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;

// run:  composer require firebase/php-jwt


Route::post('/auth/guest', function () {
    $user = User::create([
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
        'token' => JWT::encode($payload, env('JWT_SECRET'), 'HS256')
    ]);
});



Route::post('/lemonsqueezy/webhook', [LemonSqueezyWebhookController::class, 'handle']);


Route::middleware('supabase')->get('/quota', [QuotaController::class, 'show']);

// Edge worker usage callback: decrement quota or credits on successful patch
Route::middleware('supabase')->post('/usage', function (Request $request) {
    $claims = $request->attributes->get('supabase_claims');
    $user = null;
    if ($claims && isset($claims->email)) {
        $user = User::where('email', $claims->email)->first();
    }
    if (!$user) {
        $guestSub = $request->attributes->get('guest_sub');
        if ($guestSub) {
            $user = User::find($guestSub);
        }
    }
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // Prefer consuming paid credits if available; otherwise consume free quota
    if ($user->credits > 0) {
        $user->decrement('credits', 1);
    } else {
        $user->decrement('quota_remaining', 1);
    }
    $user->save();

    return response()->json([
        'plan' => $user->plan,
        'remaining' => $user->quota_remaining,
        'credits' => $user->credits,
    ]);
});


// Route removed as we're using TopUpController for payments

// listingo-app/routes/api.php
Route::post('/topup/session',  [TopUpController::class, 'createSession']);
