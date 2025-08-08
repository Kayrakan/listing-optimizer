<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class QuotaController extends Controller
{
    //
    public function show(Request $request)
    {
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
            abort(404);
        }

        return response()->json([
            'plan'      => $user->plan,              // guest | pro
            'remaining' => $user->quota_remaining,  // integer
        ]);
    }

}
