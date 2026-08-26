<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateApproval;
use App\Models\SampleRequest;
use App\Services\AuditService;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    public function __construct(
        private AuditService $auditService
    ) {}

    public function index()
    {
        $requests = SampleRequest::where('status', SampleRequest::STATUS_PENDING_APPROVAL)
            ->with(['requester', 'lineItems.product'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Approvals/Index', [
            'pendingRequests' => $requests,
        ]);
    }

    public function show(SampleRequest $sampleRequest)
    {
        $sampleRequest->load(['requester', 'lineItems.product', 'lineItems.inventoryBatch']);

        return Inertia::render('Approvals/Show', [
            'sampleRequest' => $sampleRequest,
        ]);
    }

    public function update(UpdateApproval $request, SampleRequest $sampleRequest)
    {
        $before = $sampleRequest->toArray();

        if ($request->action === 'approve') {
            $sampleRequest->update([
                'status' => SampleRequest::STATUS_APPROVED,
                'approved_at' => now(),
                'manager_comments' => $request->manager_comments,
            ]);
            $this->auditService->log('request_approved', $sampleRequest, $before, $sampleRequest->fresh()->toArray());
        } else {
            $sampleRequest->update([
                'status' => SampleRequest::STATUS_DRAFT,
                'manager_comments' => $request->manager_comments,
            ]);
            $this->auditService->log('request_rejected', $sampleRequest, $before, $sampleRequest->fresh()->toArray());
        }

        return back()->with('success', "Request has been {$request->action}ed.");
    }
}
