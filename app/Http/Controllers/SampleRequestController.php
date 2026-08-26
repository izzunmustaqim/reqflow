<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSampleRequest;
use App\Models\SampleRequest;
use App\Models\Product;
use App\Services\AuditService;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SampleRequestController extends Controller
{
    public function __construct(
        private AuditService $auditService,
        private InventoryService $inventoryService
    ) {}

    public function create()
    {
        $products = Product::where('is_active', true)->get();
        $batches = $this->inventoryService->getAvailableBatches();

        return Inertia::render('SampleRequests/Create', [
            'products' => $products,
            'availableBatches' => $batches,
        ]);
    }

    public function store(StoreSampleRequest $request)
    {
        $sampleRequest = DB::transaction(function () use ($request) {
            $sr = SampleRequest::create([
                'requester_id' => $request->user()->id,
                'customer_site' => $request->customer_site,
                'purpose' => $request->purpose,
                'delivery_location' => $request->delivery_location,
                'remarks' => $request->remarks,
                'status' => SampleRequest::STATUS_DRAFT,
            ]);

            foreach ($request->line_items as $item) {
                $sr->lineItems()->create([
                    'product_id' => $item['product_id'],
                    'qty_requested' => $item['qty_requested'],
                ]);
            }

            return $sr;
        });

        $this->auditService->log('request_created', $sampleRequest, null, $sampleRequest->toArray());

        return redirect()->route('dashboard')->with('success', 'Sample request created successfully.');
    }

    public function submit(Request $request, SampleRequest $sampleRequest)
    {
        abort_unless($sampleRequest->requester_id === $request->user()->id, 403);
        abort_unless($sampleRequest->status === SampleRequest::STATUS_DRAFT, 400);

        $before = $sampleRequest->toArray();
        $sampleRequest->update(['status' => SampleRequest::STATUS_PENDING_APPROVAL]);
        $this->auditService->log('request_submitted', $sampleRequest, $before, $sampleRequest->fresh()->toArray());

        return back()->with('success', 'Request submitted for approval.');
    }

    public function show(SampleRequest $sampleRequest)
    {
        $sampleRequest->load(['requester', 'lineItems.product', 'lineItems.inventoryBatch', 'signOff', 'auditLogs.actor']);

        return Inertia::render('SampleRequests/Show', [
            'sampleRequest' => $sampleRequest,
        ]);
    }
}
