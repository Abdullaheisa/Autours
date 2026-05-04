<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\BackgroundSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BackgroundSettingsController extends Controller
{
    /**
     * Display a listing of the background settings.
     */
    public function index()
    {
        try {
            $settings = BackgroundSetting::orderBy('section_name')->get();
            return response()->json([
                'status' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Get all backgrounds for landing page
     */
    public function getBackgrounds()
    {
        try {
            $backgrounds = BackgroundSetting::getAllBackgrounds();
            return response()->json([
                'status' => true,
                'data' => $backgrounds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Update the specified background setting.
     */
    public function update(Request $request, $id)
    {
        try {
            $setting = BackgroundSetting::findOrFail($id);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = Str::slug($setting->section_key) . '-' . time() . '.' . $file->getClientOriginalExtension();
                $destinationPath = public_path('images/background');

                // Ensure directory exists
                if (!File::exists($destinationPath)) {
                    File::makeDirectory($destinationPath, 0755, true);
                }

                // Delete old custom image if exists
                if ($setting->image_path && File::exists(public_path($setting->image_path))) {
                    // Only delete if it's not the default image
                    if ($setting->image_path !== $setting->default_image_path) {
                        File::delete(public_path($setting->image_path));
                    }
                }

                $file->move($destinationPath, $filename);
                $setting->image_path = '/images/background/' . $filename;
            }

            if ($request->has('is_active')) {
                $setting->is_active = $request->is_active;
            }

            $setting->save();

            return response()->json([
                'status' => true,
                'message' => 'Background updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Reset background to default.
     */
    public function resetToDefault($id)
    {
        try {
            $setting = BackgroundSetting::findOrFail($id);

            // Delete custom image if exists
            if ($setting->image_path &&
                $setting->image_path !== $setting->default_image_path &&
                File::exists(public_path($setting->image_path))) {
                File::delete(public_path($setting->image_path));
            }

            $setting->image_path = null;
            $setting->save();

            return response()->json([
                'status' => true,
                'message' => 'Background reset to default',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }
}

