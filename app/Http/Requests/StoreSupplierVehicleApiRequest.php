<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierVehicleApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Photo can be: an ID reference, or a file upload via 'photo' or 'car_photo' field
            'photo' => 'nullable|required_without_all:car_photo',
            'car_photo' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:5120',
            'name' => 'required|string|between:2,1000',
            'description' => 'required|string|between:5,1000',
            'price' => 'required|numeric|between:1,999999.99',
            'week_price' => 'required|numeric|between:1,999999.99',
            'month_price' => 'required|numeric|between:1,999999.99',
            'pickup_loc' => 'required|integer|exists:branches,id',
            'category' => 'required|integer|exists:categories,id',
            'fuel_policy_id' => 'nullable|integer|exists:fuel_policies,id',
            'instant_confirmation' => 'nullable|boolean',
            'activation' => 'nullable|boolean',
            'location_types' => 'nullable|array',
            'location_types.*' => 'integer|exists:location_types,id',
            // Included can be IDs (integers) or names (strings)
            'included' => 'nullable|array',
            'included.*' => 'required|string',
            'specifications' => 'nullable|array',
            'specifications.*.name' => 'required_with:specifications|string|max:255',
            'specifications.*.value' => 'required_with:specifications|string|max:255',
            'specifications.*.icon' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required_without_all' => 'A photo reference or file upload is required.',
            'included.*.string' => 'Each included item must be an ID or name.',
        ];
    }
}
