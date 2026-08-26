<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function sampleRequests(): HasMany
    {
        return $this->hasMany(SampleRequest::class, 'requester_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'actor_id');
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isSalesRep(): bool
    {
        return $this->role === 'sales_rep';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
