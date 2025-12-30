<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('oura_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');

            // Scores (0-100)
            $table->unsignedTinyInteger('readiness_score')->nullable();
            $table->unsignedTinyInteger('sleep_score')->nullable();
            $table->unsignedTinyInteger('activity_score')->nullable();

            // Sleep metrics
            $table->unsignedInteger('total_sleep_duration')->nullable(); // seconds
            $table->unsignedInteger('deep_sleep_duration')->nullable();
            $table->unsignedInteger('rem_sleep_duration')->nullable();
            $table->unsignedInteger('light_sleep_duration')->nullable();
            $table->unsignedTinyInteger('sleep_efficiency')->nullable();

            // Heart rate
            $table->unsignedTinyInteger('resting_heart_rate')->nullable();
            $table->unsignedTinyInteger('hr_lowest')->nullable();
            $table->unsignedSmallInteger('hrv_average')->nullable();

            // Temperature
            $table->float('body_temperature_deviation')->nullable();

            // Activity
            $table->unsignedSmallInteger('active_calories')->nullable();
            $table->unsignedSmallInteger('total_calories')->nullable();
            $table->unsignedMediumInteger('steps')->nullable();
            $table->unsignedSmallInteger('target_calories')->nullable();

            // Raw data for extended analysis
            $table->json('readiness_data')->nullable();
            $table->json('sleep_data')->nullable();
            $table->json('activity_data')->nullable();

            $table->timestamps();

            // Indexes
            $table->unique(['user_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oura_data');
    }
};
