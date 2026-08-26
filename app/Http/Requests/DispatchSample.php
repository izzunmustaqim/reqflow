<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispatchSample extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'allocations' => ['required', 'array', 'min:1'],
            'allocations.*.line_item_id' => ['required', 'exists:sample_line_items,id'],
            'allocations.*.inventory_batch_id' => ['required', 'exists:inventory_batches,id'],
            'allocations.*.qty_dispatched' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'allocations.required' => 'Batch allocations are required for dispatch.',
        ];
    }
}
