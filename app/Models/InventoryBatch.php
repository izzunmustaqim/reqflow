<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class InventoryBatch extends Model
{
    protected $fillable = [
        'product_id',
        'batch_no',
        'expiry_date',
        'on_hand',
        'reserved',
        'location',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'on_hand' => 'integer',
            'reserved' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sampleLineItems(): HasMany
    {
        return $this->hasMany(SampleLineItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expiry_date', '>=', Carbon::today()->addDays($days));
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'Active'
            && $this->expiry_date->gte(Carbon::today()->addDays(30))
            && ($this->on_hand - $this->reserved) > 0;
    }

    public function getRemainingAttribute(): int
    {
        return $this->on_hand - $this->reserved;
    }
}
