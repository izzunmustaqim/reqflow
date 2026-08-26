<?php

namespace App\Http\Controllers;

use App\Models\SampleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $statusFilter = $request->input('status');

        $query = SampleRequest::with(['requester', 'lineItems.product']);

        if ($user->isSalesRep()) {
            $query->where('requester_id', $user->id);
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $requests = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total' => SampleRequest::count(),
            'pending' => SampleRequest::where('status', 'Pending Approval')->count(),
            'approved' => SampleRequest::where('status', 'Approved')->count(),
            'dispatched' => SampleRequest::where('status', 'Dispatched')->count(),
            'signed' => SampleRequest::where('status', 'Signed')->count(),
        ];

        return Inertia::render('Dashboard', [
            'requests' => $requests,
            'stats' => $stats,
            'currentStatus' => $statusFilter ?? 'all',
        ]);
    }
}
