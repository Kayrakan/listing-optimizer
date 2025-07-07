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
        Schema::create('listing_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_uuid')->index();
            $table->string('sku');
            $table->enum('status', ['queued', 'ready', 'patched', 'error']);
            $table->json('result_json')->nullable();
            $table->timestamps();

            $table->foreign('user_uuid')->references('uuid')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listing_jobs');
    }
};
