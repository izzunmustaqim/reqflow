<?php

namespace App\Services;

use App\Models\InventoryBatch;
use App\Models\SampleRequest;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function allocateBatch(
        InventoryBatch $batch,
        int $quantity
    ): bool {
        if ($batch->remaining < $quantity) {
            return false;
        }

        $batch->increment('reserved', $quantity);
        return true;
    }

    public function dispatchBatch(
        InventoryBatch $batch,
        int $quantity
    ): bool {
        if ($batch->remaining < $quantity) {
            return false;
        }

        DB::transaction(function () use ($batch, $quantity) {
            $batch->decrement('on_hand', $quantity);
            $batch->decrement('reserved', $quantity);

            if ($batch->on_hand <= 0) {
                $batch->update(['status' => 'Expired']);
            }
        });

        return true;
    }

    public function getAvailableBatches(): \Illuminate\Database\Eloquent\Collection
    {
        return InventoryBatch::active()
            ->expiringSoon(30)
            ->with('product')
            ->get()
            ->filter(fn ($batch) => $batch->remaining > 0);
    }
}
