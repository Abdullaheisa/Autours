<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RentalRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rates'=>'required|array',
            'rates.*'=>'required|integer|min:1',
            'comment'=>'nullable|string|max:2000|min:10',
            'id'=>'required|numeric|integer|exists:rentals,id',
        ];
    }
}
