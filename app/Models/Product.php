<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'storage_requirement',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function inventoryBatches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    public function sampleLineItems(): HasMany
    {
        return $this->hasMany(SampleLineItem::class);
    }

    public function getAvailableStockAttribute(): int
    {
        return $this->inventoryBatches()
            ->where('status', 'Active')
            ->sum('on_hand') - $this->inventoryBatches()
            ->where('status', 'Active')
            ->sum('reserved');
    }
}
