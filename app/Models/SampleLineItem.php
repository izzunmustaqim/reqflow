<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SampleLineItem extends Model
{
    protected $fillable = [
        'sample_request_id',
        'product_id',
        'inventory_batch_id',
        'qty_requested',
        'qty_dispatched',
    ];

    protected function casts(): array
    {
        return [
            'qty_requested' => 'integer',
            'qty_dispatched' => 'integer',
        ];
    }

    public function sampleRequest(): BelongsTo
    {
        return $this->belongsTo(SampleRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryBatch(): BelongsTo
    {
        return $this->belongsTo(InventoryBatch::class);
    }
}
