<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContestSetting;
use App\Models\ContestRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class AdminContestController extends Controller
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

    public function updateSettings(Request $request)
    {
        $setting = ContestSetting::first();
        if (!$setting) {
            $setting = ContestSetting::create();
        }
        
        if ($request->has('enabled')) {
            $setting->enabled = filter_var($request->enabled, FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('forceInteraction')) {
            $setting->force_interaction = filter_var($request->forceInteraction, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('banner')) {
            $request->validate([
                'banner' => 'image|max:20480'
            ]);

            $file = $request->file('banner');
            $filename = 'contest-banner-' . time() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('images/contest');

            if (!File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }

            if ($setting->banner && File::exists(public_path($setting->banner))) {
                File::delete(public_path($setting->banner));
            }

            $file->move($destinationPath, $filename);
            $setting->banner = '/images/contest/' . $filename;
        } elseif ($request->has('banner') && ($request->banner === null || $request->banner === 'null' || $request->banner === '')) {
            if ($setting->banner && File::exists(public_path($setting->banner))) {
                File::delete(public_path($setting->banner));
            }
            $setting->banner = null;
        }
        
        $setting->save();
        
        return response()->json([
            'enabled' => $setting->enabled,
            'campaignVersion' => $setting->campaign_version,
            'forceInteraction' => $setting->force_interaction,
            'banner' => $setting->banner
        ]);
    }

    public function resetCampaign()
    {
        $setting = ContestSetting::first();
        if (!$setting) {
            $setting = ContestSetting::create();
        }
        $setting->campaign_version += 1;
        $setting->save();

        return response()->json([
            'enabled' => $setting->enabled,
            'campaignVersion' => $setting->campaign_version,
            'forceInteraction' => $setting->force_interaction,
            'banner' => $setting->banner
        ]);
    }

    public function getRegistrations(Request $request)
    {
        $query = ContestRegistration::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }
        
        if ($request->filled('campaign_version')) {
            $query->where('campaign_version', $request->campaign_version);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->date_from)));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->date_to)));
        }

        $perPage = $request->get('per_page', 50);
        $registrations = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $data = $registrations->map(function($reg) {
            return [
                'id' => 'reg_' . $reg->id,
                'name' => $reg->name,
                'phone' => $reg->phone,
                'email' => $reg->email,
                'country' => $reg->country,
                'date' => $reg->created_at->toIso8601String()
            ];
        });

        return response()->json([
            'data' => $data,
            'total' => $registrations->total(),
            'current_page' => $registrations->currentPage(),
            'last_page' => $registrations->lastPage(),
            'per_page' => $registrations->perPage()
        ]);
    }

    public function deleteRegistration($id)
    {
        $id = str_replace('reg_', '', $id);
        $reg = ContestRegistration::find($id);
        if ($reg) {
            $reg->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Registration deleted successfully.'
        ]);
    }
}
