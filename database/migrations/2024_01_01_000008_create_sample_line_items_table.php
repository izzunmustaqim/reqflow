<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sample_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sample_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('inventory_batch_id')->nullable()->constrained();
            $table->integer('qty_requested')->default(0);
            $table->integer('qty_dispatched')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sample_line_items');
    }
};
