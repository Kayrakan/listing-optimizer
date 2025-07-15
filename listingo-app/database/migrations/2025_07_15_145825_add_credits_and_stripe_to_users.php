<?php
// database/migrations/2025_07_15_145825_add_credits_and_stripe_to_users.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**  Disable automatic transaction (Cockroach friendly)  */
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            if (!Schema::hasColumn('users', 'credits')) {
                $t->unsignedInteger('credits')->default(0);
            }
            if (!Schema::hasColumn('users', 'stripe_customer_id')) {
                $t->string('stripe_customer_id')->nullable()->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $t) {
            if (Schema::hasColumn('users', 'credits')) {
                $t->dropColumn('credits');
            }
            if (Schema::hasColumn('users', 'stripe_customer_id')) {
                $t->dropColumn('stripe_customer_id');
            }
        });
    }
};
