<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookCarRequest extends FormRequest
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
            'pickupLoc' => 'required',
            'time_from' => 'required|date_format:H:i',
            'time_to' => 'required|date_format:H:i',
            'old_rental_id' => 'nullable|integer|exists:rentals,id',
            'flight_number' => 'nullable|string|max:50',
            'extras' => 'nullable|array',
            'extras_price' => 'nullable|numeric|min:0',
            'driver_age' => 'nullable|string|max:20',
            'residence_country' => 'nullable|string|max:100',
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'name' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:30',
        ];
    }
}
