<?php

namespace App\Http\Controllers;

use App\Http\Requests\DispatchSample;
use App\Models\SampleRequest;
use App\Models\InventoryBatch;
use App\Services\AuditService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DispatchController extends Controller
{
    public function __construct(
        private InventoryService $inventoryService,
        private AuditService $auditService
    ) {}

    public function index()
    {
        $requests = SampleRequest::where('status', SampleRequest::STATUS_APPROVED)
            ->with(['requester', 'lineItems.product'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Dispatch/Index', [
            'dispatchableRequests' => $requests,
        ]);
    }

    public function show(SampleRequest $sampleRequest)
    {
        $sampleRequest->load(['requester', 'lineItems.product', 'lineItems.inventoryBatch']);
        $batches = InventoryBatch::active()
            ->expiringSoon(30)
            ->with('product')
            ->get()
            ->filter(fn ($b) => $b->remaining > 0);

        return Inertia::render('Dispatch/Show', [
            'sampleRequest' => $sampleRequest,
            'availableBatches' => $batches->values(),
        ]);
    }

    public function dispatch(DispatchSample $request, SampleRequest $sampleRequest)
    {
        $before = $sampleRequest->toArray();

        foreach ($request->allocations as $allocation) {
            $lineItem = $sampleRequest->lineItems()->findOrFail($allocation['line_item_id']);
            $batch = InventoryBatch::findOrFail($allocation['inventory_batch_id']);

            if (!$this->inventoryService->dispatchBatch($batch, $allocation['qty_dispatched'])) {
                return back()->withErrors([
                    "allocations.{$allocation['line_item_id']}" => 'Insufficient batch quantity for allocation.',
                ]);
            }

            $lineItem->update([
                'inventory_batch_id' => $batch->id,
                'qty_dispatched' => $allocation['qty_dispatched'],
            ]);
        }

        $sampleRequest->update([
            'status' => SampleRequest::STATUS_DISPATCHED,
            'dispatched_at' => now(),
        ]);

        $this->auditService->log('request_dispatched', $sampleRequest, $before, $sampleRequest->fresh()->toArray());

        return redirect()->route('dispatch.index')->with('success', 'Sample dispatched successfully.');
    }
}
