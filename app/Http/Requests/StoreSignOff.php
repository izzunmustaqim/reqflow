<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSignOff extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signer_name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:255'],
            'signature_data' => ['required', 'string'],
            'stamp_photo' => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'signature_data.required' => 'Signature is required to complete sign-off.',
        ];
    }
}
