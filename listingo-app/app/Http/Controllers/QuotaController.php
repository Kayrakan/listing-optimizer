<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class QuotaController extends Controller
{
    //
    public function show(Request $request)
    {
        // The Supabase-JWT middleware already set the claims on the request:
        $claims = $request->attributes->get('supabase_claims');

        // For guest (HS256) tokens we don't have Supabase claims,
        // so fall back to our own HS payload parsed in middleware
        $userId = $claims->sub ?? $request->attributes->get('guest_sub');

        /** @var User $user */
        $user = User::findOrFail($userId);

        return response()->json([
            'plan'      => $user->plan,              // guest | pro
            'remaining' => $user->quota_remaining,  // integer
        ]);
    }

}
