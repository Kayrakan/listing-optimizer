<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\JWK as FirebaseJwk;
use Illuminate\Support\Facades\Cache;

class VerifySupabaseJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Missing token'], 401);
        }

        $token = substr($authHeader, 7);

        // Try Supabase RS256 verification first (preferred)
        $jwks = Cache::remember('supabase.jwk', now()->addMinutes(15), function () {
            $json = @file_get_contents(config('services.supabase.jwk'));
            return $json ? json_decode($json, true) : null;
        });

        $verified = false;
        if ($jwks && isset($jwks['keys'])) {
            try {
                $keys = FirebaseJwk::parseKeySet($jwks);
                $claims = JWT::decode($token, $keys);
                $request->attributes->set('supabase_claims', $claims);
                $verified = true;
            } catch (\Throwable $e) {
                // fall through to HS256 guest decode
            }
        }

        // Fallback: our guest HS256 tokens issued by /auth/guest
        if (!$verified) {
            $secret = (string) env('JWT_SECRET');
            if ($secret === '') {
                return response()->json(['message' => 'Invalid token'], 401);
            }
            try {
                $claims = JWT::decode($token, new Key($secret, 'HS256'));
                // Attach minimal info for controllers
                if (isset($claims->sub)) {
                    $request->attributes->set('guest_sub', $claims->sub);
                }
                $verified = true;
            } catch (\Throwable $e) {
                return response()->json(['message' => 'Invalid token'], 401);
            }
        }

        return $next($request);
    }
}
