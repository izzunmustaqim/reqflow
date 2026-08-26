<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sign_offs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sample_request_id')->constrained()->cascadeOnDelete();
            $table->string('signer_name');
            $table->string('role');
            $table->timestamp('signed_at');
            $table->string('signature_path');
            $table->string('stamp_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sign_offs');
    }
};
