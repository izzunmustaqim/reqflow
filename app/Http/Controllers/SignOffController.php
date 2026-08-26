<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSignOff;
use App\Models\SampleRequest;
use App\Models\SignOff;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SignOffController extends Controller
{
    public function __construct(
        private AuditService $auditService
    ) {}

    public function show(SampleRequest $sampleRequest)
    {
        $sampleRequest->load(['lineItems.product', 'lineItems.inventoryBatch']);

        return Inertia::render('SignOff/Show', [
            'sampleRequest' => $sampleRequest,
        ]);
    }

    public function store(StoreSignOff $request, SampleRequest $sampleRequest)
    {
        $before = $sampleRequest->toArray();

        $raw = preg_replace('/^data:image\/\w+;base64,/', '', $request->signature_data);
        $imageData = base64_decode($raw);
        $filename = 'sig_' . $sampleRequest->request_id . '_' . time() . '.png';
        Storage::disk('public')->put('signatures/' . $filename, $imageData);
        $signaturePath = 'signatures/' . $filename;

        $stampPath = null;
        if ($request->hasFile('stamp_photo')) {
            $stampPath = $request->file('stamp_photo')->store('stamps', 'public');
        }

        SignOff::create([
            'sample_request_id' => $sampleRequest->id,
            'signer_name' => $request->signer_name,
            'role' => $request->role,
            'signed_at' => now(),
            'signature_path' => $signaturePath,
            'stamp_path' => $stampPath,
        ]);

        $sampleRequest->update([
            'status' => SampleRequest::STATUS_SIGNED,
            'signed_at' => now(),
        ]);

        $this->auditService->log('request_signed', $sampleRequest, $before, $sampleRequest->fresh()->toArray());

        return Inertia::render('SignOff/Receipt', [
            'sampleRequest' => $sampleRequest->fresh()->load(['requester', 'lineItems.product', 'lineItems.inventoryBatch', 'signOff']),
        ]);
    }
}
