<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sample_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id')->unique();
            $table->foreignId('requester_id')->constrained('users');
            $table->string('customer_site');
            $table->string('purpose');
            $table->enum('status', [
                'Draft', 'Submitted', 'Pending Approval',
                'Approved', 'Dispatched', 'Signed', 'Closed'
            ])->default('Draft');
            $table->string('delivery_location');
            $table->text('remarks')->nullable();
            $table->text('manager_comments')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['requester_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sample_requests');
    }
};
