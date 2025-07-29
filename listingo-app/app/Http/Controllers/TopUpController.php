<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;
use LemonSqueezy\Laravel\Facades\LemonSqueezy;

class TopUpController extends Controller
{
    /**
     * Create a LemonSqueezy checkout session for purchasing credits
     *
     * @param Request $r
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSession(Request $r)
    {
        try {
            // Validate request
            $r->validate([
                'cents' => 'required|integer|min:100', // Minimum amount is $1.00
                'email' => 'required|email',
            ]);

            $amountCents = $r->integer('cents');          // 1000 = $10
            $email = $r->input('email');

            // Log the request
            Log::info('Creating LemonSqueezy checkout session', [
                'email' => $email,
                'amount' => $amountCents
            ]);

            // Calculate credits
            $credits = (int) round(($amountCents / 100) / config('app.usd_per_patch', 0.10));

            // Create checkout session
            $checkout = LemonSqueezy::createCheckout(
                config('lemonsqueezy.store_id'),
                config('lemonsqueezy.variant_id'),
                [
                    'checkout' => [
                        'custom_price' => $amountCents,
                        'email' => $email,
                        'success_url' => config('app.url').'/topup/success',
                        'cancel_url' => config('app.url').'/topup/cancel',
                    ],
                    'custom_data' => [
                        'credits' => $credits
                    ]
                ]
            );

            return response()->json(['url' => $checkout['url']]);
        } catch (Exception $e) {
            // Other errors
            Log::error('Error creating checkout session', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create checkout session'], 500);
        }
    }
}
