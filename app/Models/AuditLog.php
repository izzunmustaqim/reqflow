<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'event_type',
        'actor_id',
        'timestamp',
        'payload_before_after',
        'sample_request_id',
    ];

    protected function casts(): array
    {
        return [
            'timestamp' => 'datetime',
            'payload_before_after' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function sampleRequest(): BelongsTo
    {
        return $this->belongsTo(SampleRequest::class);
    }
}
