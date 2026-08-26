<?php

namespace App\Http\Controllers;

use App\Models\SampleRequest;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $query = SampleRequest::with(['requester', 'lineItems.product', 'lineItems.inventoryBatch', 'signOff'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_id', 'ilike', "%{$search}%")
                  ->orWhere('customer_site', 'ilike', "%{$search}%");
            });
        }

        $requests = $query->paginate(20)->withQueryString();

        $auditLogs = AuditLog::with(['actor', 'sampleRequest'])
            ->latest('timestamp')
            ->paginate(20);

        return Inertia::render('Admin/Index', [
            'allRequests' => $requests,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function export(Request $request)
    {
        $query = SampleRequest::with(['requester', 'lineItems.product', 'lineItems.inventoryBatch', 'signOff'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->get();

        $headers = [
            'Request ID', 'Customer Site', 'Purpose', 'Status',
            'Requester', 'Delivery Location', 'Approved At',
            'Dispatched At', 'Signed At', 'Product', 'Batch No',
            'Qty Requested', 'Qty Dispatched', 'Signer Name', 'Signed At',
        ];

        $callback = function () use ($requests, $headers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);

            foreach ($requests as $request) {
                foreach ($request->lineItems as $lineItem) {
                    fputcsv($handle, [
                        $request->request_id,
                        $request->customer_site,
                        $request->purpose,
                        $request->status,
                        $request->requester->name,
                        $request->delivery_location,
                        $request->approved_at?->format('Y-m-d H:i'),
                        $request->dispatched_at?->format('Y-m-d H:i'),
                        $request->signed_at?->format('Y-m-d H:i'),
                        $lineItem->product->name ?? $lineItem->product->sku,
                        $lineItem->inventoryBatch?->batch_no ?? 'N/A',
                        $lineItem->qty_requested,
                        $lineItem->qty_dispatched ?? 'N/A',
                        $request->signOff?->signer_name ?? 'N/A',
                        $request->signOff?->signed_at?->format('Y-m-d H:i') ?? 'N/A',
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="sample_requests_export_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
