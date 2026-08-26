<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\InventoryBatch;
use App\Models\SampleRequest;
use App\Models\SampleLineItem;
use App\Models\SignOff;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $salesRep = User::create(['name' => 'Aminah Rahman', 'email' => 'aminah@samplehub.com', 'password' => bcrypt('password'), 'role' => 'sales_rep']);
        $manager = User::create(['name' => 'Dr. Sarah Tan', 'email' => 'sarah@samplehub.com', 'password' => bcrypt('password'), 'role' => 'manager']);
        $admin = User::create(['name' => 'Admin User', 'email' => 'admin@samplehub.com', 'password' => bcrypt('password'), 'role' => 'admin']);

        $products = [
            Product::create(['sku' => 'FS-001', 'name' => 'Fresubin Original', 'description' => 'Standard nutrition formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-002', 'name' => 'Fresubin Energy', 'description' => 'High-energy formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-003', 'name' => 'Fresubin HP', 'description' => 'High-protein formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-004', 'name' => 'Fresubin Renal', 'description' => 'Renal-specific formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-005', 'name' => 'Fresubin Diabetes', 'description' => 'Diabetes-optimized formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-006', 'name' => 'Fresubin Compact', 'description' => 'Compact nutrition 125ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-007', 'name' => 'Fresubin Jevity', 'description' => 'Fiber-enriched formula 200ml', 'storage_requirement' => 'Room temp']),
            Product::create(['sku' => 'FS-008', 'name' => 'Fresubin 2 kcal', 'description' => 'High-density formula 200ml', 'storage_requirement' => 'Refrigerate']),
        ];

        foreach ($products as $product) {
            for ($i = 1; $i <= 3; $i++) {
                InventoryBatch::create([
                    'product_id' => $product->id,
                    'batch_no' => "{$product->sku}-B{$i}" . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                    'expiry_date' => Carbon::now()->addMonths(rand(3, 12)),
                    'on_hand' => rand(50, 200),
                    'reserved' => 0,
                    'location' => ['A-1-01', 'A-1-02', 'A-2-01', 'B-1-01', 'B-2-01'][rand(0, 4)],
                    'status' => 'Active',
                ]);
            }
        }

        $statuses = ['Draft', 'Submitted', 'Pending Approval', 'Approved', 'Dispatched', 'Signed'];
        $sites = ['Hospital Kuala Lumpur', 'Pantai Hospital KL', 'Gleneagles Hospital', 'Sunway Medical Centre', 'Subang Jaya Medical Centre'];
        $purposes = ['Product evaluation', 'Clinical trial preparation', 'Dietitian assessment', 'Nutrition department review'];

        foreach (range(1, 15) as $i) {
            $status = $statuses[array_rand($statuses)];
            $sr = SampleRequest::create([
                'request_id' => 'SR-' . strtoupper(substr(uniqid(), -8)),
                'requester_id' => $salesRep->id,
                'customer_site' => $sites[array_rand($sites)],
                'purpose' => $purposes[array_rand($purposes)],
                'status' => $status,
                'delivery_location' => 'Ward ' . chr(65 + rand(0, 5)) . '-' . rand(1, 10),
                'remarks' => $i % 3 === 0 ? 'Urgent delivery required.' : null,
                'manager_comments' => in_array($status, ['Approved', 'Dispatched', 'Signed']) ? 'Approved for dispatch.' : null,
                'approved_at' => in_array($status, ['Approved', 'Dispatched', 'Signed']) ? Carbon::now()->subDays(rand(1, 5)) : null,
                'dispatched_at' => in_array($status, ['Dispatched', 'Signed']) ? Carbon::now()->subDays(rand(1, 3)) : null,
                'signed_at' => $status === 'Signed' ? Carbon::now()->subDay() : null,
            ]);

            foreach (collect($products)->random(rand(1, 3)) as $product) {
                $batch = InventoryBatch::where('product_id', $product->id)->first();
                SampleLineItem::create([
                    'sample_request_id' => $sr->id,
                    'product_id' => $product->id,
                    'inventory_batch_id' => in_array($status, ['Dispatched', 'Signed']) ? $batch->id : null,
                    'qty_requested' => rand(5, 20),
                    'qty_dispatched' => in_array($status, ['Dispatched', 'Signed']) ? rand(5, 20) : 0,
                ]);
            }

            if ($status === 'Signed') {
                SignOff::create([
                    'sample_request_id' => $sr->id,
                    'signer_name' => 'Dr. Lee Wei Ming',
                    'role' => 'Head of Nutrition',
                    'signed_at' => $sr->signed_at,
                    'signature_path' => 'signatures/sample_sig_' . $sr->id . '.png',
                ]);
            }

            AuditLog::create([
                'event_type' => 'request_created',
                'actor_id' => $salesRep->id,
                'timestamp' => $sr->created_at,
                'payload_before_after' => ['before' => null, 'after' => $sr->toArray()],
                'sample_request_id' => $sr->id,
            ]);
        }
    }
}
