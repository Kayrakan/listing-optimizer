<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use Exception;
use LemonSqueezy\Laravel\Facades\LemonSqueezy;

class LemonSqueezyWebhookController extends Controller
{
    /**
     * Handle LemonSqueezy webhook events
     *
     * @param Request $req
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $req)
    {
        try {
            // Verify the webhook signature
            $payload = $req->getContent();
            $signature = $req->header('X-Signature');

            if (!LemonSqueezy::verifyWebhookSignature($payload, $signature)) {
                Log::error('Webhook signature verification failed');
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            $event = json_decode($payload, true);
            $eventName = $event['meta']['event_name'] ?? '';

            Log::info('LemonSqueezy webhook received', ['type' => $eventName]);

            // Process order_created and order_refunded events
            if ($eventName !== 'order_created' && $eventName !== 'order_refunded') {
                return response()->json(['ok' => true]);
            }

            $data = $event['data']['attributes'] ?? [];
            $amount = $data['total'] ?? 0;                      // cents
            $email = $data['user_email'] ?? '';
            $customer = $data['customer_id'] ?? '';

            /* ---- credit maths ---- */
            $credits = (int) round(($amount / 100) / config('app.usd_per_patch', 0.10));

            if ($eventName === 'order_created') {
                Log::info('Processing payment', [
                    'email' => $email,
                    'amount' => $amount,
                    'credits' => $credits
                ]);

                /* ---- local DB (Cockroach) ---- */
                DB::transaction(function () use ($email, $customer, $credits) {
                    $user = User::firstOrCreate(['email' => $email]);
                    $user->increment('credits', $credits);
                    $user->lemonsqueezy_customer_id = $customer;
                    $user->save();
                });
            } elseif ($eventName === 'order_refunded') {
                Log::info('Processing refund', [
                    'email' => $email,
                    'amount' => $amount,
                    'credits' => $credits
                ]);

                /* ---- local DB (Cockroach) ---- */
                DB::transaction(function () use ($email, $credits) {
                    $user = User::where('email', $email)->first();
                    if ($user) {
                        $user->decrement('credits', $credits);
                        $user->save();
                    } else {
                        Log::warning('User not found for refund', ['email' => $email]);
                    }
                });
            }

            // Only perform Supabase operations for new orders, not for refunds
            if ($eventName === 'order_created') {
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
                    'redirect_to'  => config('app.url').'/supabase/complete',
                ]);
                $invite->throw();

                return response()->json(['credits_added' => $credits]);
            } else {
                // For refunds, just return the number of credits deducted
                return response()->json(['credits_deducted' => $credits]);
            }

        } catch (Exception $e) {
            // Other errors
            Log::error('Webhook processing failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }
}
