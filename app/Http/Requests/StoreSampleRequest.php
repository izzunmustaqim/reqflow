<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSampleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_site' => ['required', 'string', 'max:255'],
            'purpose' => ['required', 'string', 'max:500'],
            'delivery_location' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'line_items' => ['required', 'array', 'min:1'],
            'line_items.*.product_id' => ['required', 'exists:products,id'],
            'line_items.*.qty_requested' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'line_items.required' => 'At least one product must be added to the request.',
            'line_items.min' => 'At least one product must be added to the request.',
            'line_items.*.qty_requested.min' => 'Quantity must be at least 1.',
        ];
    }
}
