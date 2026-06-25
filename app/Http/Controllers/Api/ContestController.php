<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContestSetting;
use App\Models\ContestRegistration;
use Illuminate\Http\Request;

class ContestController extends Controller
{
    public function getSettings()
    {
        $setting = ContestSetting::first();
        if (!$setting) {
            $setting = ContestSetting::create();
        }
        return response()->json([
            'enabled' => $setting->enabled,
            'campaignVersion' => $setting->campaign_version,
            'forceInteraction' => $setting->force_interaction,
            'banner' => $setting->banner
        ]);
    }

    public function registerUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email'
        ]);

        $setting = ContestSetting::first();
        $campaignVersion = $setting ? $setting->campaign_version : 1;

        $exists = ContestRegistration::where('email', $request->email)
            ->where('campaign_version', $campaignVersion)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This email is already registered for the current campaign.',
                'code' => 'ALREADY_REGISTERED'
            ], 409);
        }

        $registration = ContestRegistration::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'country' => $request->country,
            'campaign_version' => $campaignVersion
        ]);

        return response()->json([
            'id' => 'reg_' . $registration->id,
            'name' => $registration->name,
            'phone' => $registration->phone,
            'email' => $registration->email,
            'country' => $registration->country,
            'date' => $registration->created_at->toIso8601String()
        ], 201);
    }
}
