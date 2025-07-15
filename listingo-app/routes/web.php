<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::view('/supabase/complete', 'supabase-complete')->name('supabase.complete');
