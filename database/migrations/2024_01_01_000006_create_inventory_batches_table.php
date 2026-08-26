<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('batch_no');
            $table->date('expiry_date');
            $table->integer('on_hand')->default(0);
            $table->integer('reserved')->default(0);
            $table->string('location');
            $table->enum('status', ['Active', 'Expired'])->default('Active');
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
