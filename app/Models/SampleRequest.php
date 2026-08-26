<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class SampleRequest extends Model
{
    protected $fillable = [
        'request_id',
        'requester_id',
        'customer_site',
        'purpose',
        'status',
        'delivery_location',
        'remarks',
        'manager_comments',
        'approved_at',
        'dispatched_at',
        'signed_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'dispatched_at' => 'datetime',
            'signed_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (SampleRequest $request) {
            if (empty($request->request_id)) {
                $request->request_id = 'SR-' . strtoupper(Str::random(8));
            }
        });
    }

    const STATUS_DRAFT = 'Draft';
    const STATUS_SUBMITTED = 'Submitted';
    const STATUS_PENDING_APPROVAL = 'Pending Approval';
    const STATUS_APPROVED = 'Approved';
    const STATUS_DISPATCHED = 'Dispatched';
    const STATUS_SIGNED = 'Signed';
    const STATUS_CLOSED = 'Closed';

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(SampleLineItem::class);
    }

    public function signOff(): HasOne
    {
        return $this->hasOne(SignOff::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function getStatusBadgeColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_DRAFT => 'slate',
            self::STATUS_SUBMITTED => 'blue',
            self::STATUS_PENDING_APPROVAL => 'amber',
            self::STATUS_APPROVED => 'emerald',
            self::STATUS_DISPATCHED => 'violet',
            self::STATUS_SIGNED => 'cyan',
            self::STATUS_CLOSED => 'zinc',
            default => 'slate',
        };
    }

    public static function statusOptions(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_SUBMITTED,
            self::STATUS_PENDING_APPROVAL,
            self::STATUS_APPROVED,
            self::STATUS_DISPATCHED,
            self::STATUS_SIGNED,
            self::STATUS_CLOSED,
        ];
    }
}
