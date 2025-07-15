<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\StripeClient;

class TopUpController extends Controller
{
    //
    public function createSession(Request $r)
    {
        $amountCents = $r->integer('cents');          // 1000 = $10

        $stripe = new StripeClient(config('stripe.secret'));

        $session = $stripe->checkout->sessions->create([
            'mode'          => 'payment',
            'customer_email'=> $r->input('email'),
            'line_items'    => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => ['name' => 'Listing-Optimizer credits'],
                    'unit_amount'  => $amountCents,
                ],
                'quantity' => 1,
            ]],
            'success_url'   => config('app.url').'/topup/success',
            'cancel_url'    => config('app.url').'/topup/cancel',
        ]);

        return ['url' => $session->url];
    }

}
