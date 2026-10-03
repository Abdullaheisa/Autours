<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'email'=>'required|string|max:255|unique:users,email',
            'password'=>'required|string|max:255|min:6',
            'phone'=>'required|string|unique:users,phone_num',
            'name'=>'nullable|string|max:255',
            'first_name'=>'nullable|string|max:100',
            'last_name'=>'nullable|string|max:100',
            'gender'=>'nullable|string|max:20',
            'country'=>'nullable|string|max:100',
        ];
    }
}
