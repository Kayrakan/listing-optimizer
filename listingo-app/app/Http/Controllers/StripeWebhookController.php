<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;


class StripeWebhookController extends Controller
{
    //

    public function handle(Request $req)
    {
        $event = Webhook::constructEvent(
            $req->getContent(),
            $req->header('Stripe-Signature'),
            env('STRIPE_WEBHOOK_SECRET')
        );

        if ($event->type !== 'payment_intent.succeeded') {
            return response()->json(['ok' => true]);
        }

        $pi       = $event->data->object;
        $amount   = $pi->amount_received;                      // cents
        $email    = $pi->charges->data[0]->billing_details->email;
        $customer = $pi->customer;

        /* ---- credit maths ---- */
        $credits = (int) round(($amount / 100) / env('USD_PER_PATCH', 0.10));

        /* ---- local DB (Cockroach) ---- */
        DB::transaction(function () use ($email, $customer, $credits) {
            $user = User::firstOrCreate(['email' => $email]);
            $user->increment('credits', $credits);
            $user->stripe_customer_id = $customer;
            $user->save();
        });

        /* ---- Supabase : find / create / invite ---- */
        $sb = Http::supabase();

        // 1️⃣ lookup
        $lookup = $sb->get('admin/users', ['email' => $email]);
        $sbUser = $lookup->json('users.0');   // null if not found

        // 2️⃣ create if needed
        if (!$sbUser) {
            $create = $sb->post('admin/users', [
                'email'          => $email,
                'email_confirm'  => false,
            ]);
            $create->throw();
            $sbUser = $create->json();
        }

        // 3️⃣ send magic-link
        $invite = $sb->post('admin/invite', [
            'email'        => $email,
            'redirect_to'  => env('APP_URL').'/supabase/complete',
        ]);
        $invite->throw();

        return response()->json(['credits_added' => $credits]);
    }

}
