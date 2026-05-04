<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateEditVehicle extends FormRequest
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
            'update' => 'nullable|between:1,2',
            'photo' => 'required|string|between:1,1000',
            'name' => 'required|string|between:2,1000',
            'description' => 'required|string|between:5,1000',
            'price' => 'required|numeric|between:1,999999.99',
            'week_price' => 'required|numeric|between:1,999999.99',
            'month_price' => 'required|numeric|between:1,999999.99',
            'specifications' => 'required',
            'included' => 'required|string',
            'instant_confirmation' => 'required',
        ];
    }
}
