<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;

class VerifySupabaseJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        // Bearer <token> header
        $auth = $request->header('Authorization');
        if (! $auth || ! str_starts_with($auth, 'Bearer ')) {
            return response()->json(['message' => 'Missing token'], 401);
        }

        $token = substr($auth, 7);

        // Fetch / cache JWK set for 15 min
        $jwk = Cache::remember('supabase.jwk', now()->addMinutes(15), function () {
            $json = file_get_contents(config('services.supabase.jwk'));
            return json_decode($json, true);
        });

        try {
            $decoded = JWT::decode($token, new Key($jwk['keys'][0]['x5c'][0], 'RS256'));
            // Attach claims for later use
            $request->attributes->set('supabase_claims', $decoded);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}
