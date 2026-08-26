<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\SampleRequest;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    public function log(
        string $eventType,
        SampleRequest $sampleRequest,
        ?array $payloadBefore = null,
        ?array $payloadAfter = null
    ): AuditLog {
        return AuditLog::create([
            'event_type' => $eventType,
            'actor_id' => Auth::id(),
            'timestamp' => now(),
            'payload_before_after' => [
                'before' => $payloadBefore,
                'after' => $payloadAfter,
            ],
            'sample_request_id' => $sampleRequest->id,
        ]);
    }
}
