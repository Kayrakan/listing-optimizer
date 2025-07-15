<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //

        Http::macro('supabase', function () {
            return Http::baseUrl(config('supabase.url').'/auth/v1')
                ->withToken(config('supabase.service_role_key'))
                ->acceptJson();
        });

    }
}
