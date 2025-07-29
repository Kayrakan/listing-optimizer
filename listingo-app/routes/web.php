<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// LemonSqueezy checkout success and cancel routes
Route::get('/topup/success', function () {
    return view('topup.success');
})->name('topup.success');

Route::get('/topup/cancel', function () {
    return view('topup.cancel');
})->name('topup.cancel');

Route::view('/supabase/complete', 'supabase-complete')->name('supabase.complete');
