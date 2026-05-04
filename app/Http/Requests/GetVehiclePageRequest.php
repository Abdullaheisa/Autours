<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetVehiclePageRequest extends FormRequest
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
            'id' => 'required|integer|exists:vehicles,id',
            'date_from' => 'required|date_format:Y-m-d',
            'date_to' => 'required|date_format:Y-m-d|after:date_from',
            'currency' => 'required|string|exists:currencies,name',
            'pickupLoc' => 'required|string|exists:branches,location',
            'time_from' => 'required|date_format:H:i',
            'time_to' => 'required|date_format:H:i'
        ];
    }
}
