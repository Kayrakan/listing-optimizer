<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;
use LemonSqueezy\Laravel\Checkout; // updated import
use LemonSqueezy\Laravel\LemonSqueezy; // for API preflight

class TopUpController extends Controller
{
    /**
     * Create a LemonSqueezy checkout session for purchasing credits
     */
    public function createSession(Request $r)
    {
        try {
            $r->validate([
                'cents' => 'required|integer|min:100',
                'email' => 'required|email',
            ]);

            $amountCents = $r->integer('cents');
            $email = $r->input('email');

            $storeId = (string) config('lemon-squeezy.store_id');
            $variantId = (string) config('lemon-squeezy.variant_id');

            Log::info('Creating LemonSqueezy checkout session', [
                'email' => $email,
                'amount' => $amountCents,
                'store_id' => $storeId,
                'variant_id' => $variantId,
            ]);

            // Validate config present and numeric
            if ($storeId === '' || $variantId === '') {
                Log::error('LemonSqueezy config missing', [
                    'store_id' => $storeId,
                    'variant_id' => $variantId,
                ]);
                return response()->json(['error' => 'Checkout misconfiguration: set LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_VARIANT_ID'], 500);
            }
            if (!ctype_digit($storeId) || !ctype_digit($variantId)) {
                Log::error('LemonSqueezy IDs must be numeric', [
                    'store_id' => $storeId,
                    'variant_id' => $variantId,
                ]);
                return response()->json(['error' => 'Checkout misconfiguration: store_id and variant_id must be numeric IDs from the dashboard'], 500);
            }

            // Preflight: fetch variant including product to validate store match
            try {
                $variantResp = LemonSqueezy::api('GET', "variants/{$variantId}?include=product");
                $json = $variantResp->json();

                $included = (array) data_get($json, 'included', []);
                $product = collect($included)->first(function ($item) {
                    return data_get($item, 'type') === 'products';
                });
                $productStoreId = (string) data_get($product, 'attributes.store_id');

                // Fallback: fetch product by product_id if store_id missing in include
                if ($productStoreId === '') {
                    $productId = (string) data_get($json, 'data.attributes.product_id');
                    if (ctype_digit($productId)) {
                        $prodResp = LemonSqueezy::api('GET', "products/{$productId}");
                        $productStoreId = (string) data_get($prodResp->json(), 'data.attributes.store_id');
                    }
                }

                if ($productStoreId === '' || $productStoreId !== $storeId) {
                    Log::error('Variant store mismatch', [
                        'expected_store' => $storeId,
                        'variant_product_store' => $productStoreId,
                    ]);
                    return response()->json(['error' => 'Checkout misconfiguration: variant/store mismatch'], 500);
                }
            } catch (Exception $e) {
                Log::error('Variant lookup failed', [
                    'variant_id' => $variantId,
                    'message' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Checkout misconfiguration: variant not found for API key/mode'], 500);
            }

            $credits = (int) round(($amountCents / 100) / config('app.usd_per_patch', 0.10));

            // Build checkout using SDK (custom data values as strings)
            $url = Checkout::make($storeId, $variantId)
                ->withCustomPrice($amountCents)
                ->withEmail($email)
                ->withCustomData(['credits' => (string) $credits])
                ->redirectTo((string) (config('app.url') . '/topup/success'))
                ->url();

            return response()->json(['url' => $url]);
        } catch (Exception $e) {
            Log::error('Error creating checkout session', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create checkout session'], 500);
        }
    }
}
