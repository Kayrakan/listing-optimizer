<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public $withinTransaction = false;   //  ← no type-hint here

    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // ─── PK as UUID ──────────────────────────────────────────────
            $table->uuid('uuid')->primary();           // <- replaces $table->id()

            // ─── Auth / profile fields (keep) ───────────────────────────
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            // ─── Business fields we need ────────────────────────────────
            $table->enum('plan', ['guest', 'pro'])->default('guest');
            $table->integer('quota_remaining')->default(10);

            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->uuid('user_uuid')->nullable()->index();      // <-- changed
            $table->foreign('user_uuid')->references('uuid')->on('users');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
