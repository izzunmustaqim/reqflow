<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SignOff extends Model
{
    protected $fillable = [
        'sample_request_id',
        'signer_name',
        'role',
        'signed_at',
        'signature_path',
        'stamp_path',
    ];

    protected function casts(): array
    {
        return [
            'signed_at' => 'datetime',
        ];
    }

    public function sampleRequest(): BelongsTo
    {
        return $this->belongsTo(SampleRequest::class);
    }
}
