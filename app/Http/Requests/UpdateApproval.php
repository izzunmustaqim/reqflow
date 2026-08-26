<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApproval extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isManager();
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'in:approve,reject'],
            'manager_comments' => [
                'required_if:action,reject',
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'manager_comments.required_if' => 'Manager comments are required when rejecting a request.',
        ];
    }
}
