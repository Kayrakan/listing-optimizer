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

    public function handle($event): void
    {
        if ($event->payload['type'] !== 'checkout.session.completed') {
            return;
        }

        $session = $event->payload['data']['object'];

        // Customer e-mail
        $email = $session['customer_details']['email'];

        // 1️⃣ Promote guest→pro in DB
        $user = User::firstWhere('email', $email);
        if ($user && $user->plan === 'guest') {
            $user->forceFill([
                'plan'             => 'pro',
                'quota_remaining'  => 10_000,
                'stripe_id'        => $session['customer'],   // link to Stripe
            ])->save();
        }

        // 2️⃣ Create Supabase user (if not exists)
        Http::withToken(config('services.supabase.service_role'))
            ->post(config('services.supabase.url').'/auth/v1/admin/users', [
                'email'    => $email,
                'password' => Str::random(32),
            ]);
    }

}
