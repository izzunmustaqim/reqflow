<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->foreignId('actor_id')->constrained('users');
            $table->timestamp('timestamp');
            $table->json('payload_before_after');
            $table->foreignId('sample_request_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->index('event_type');
            $table->index('sample_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
