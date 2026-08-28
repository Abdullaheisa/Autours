<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\CityPage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CityPageController extends Controller
{
    /**
     * Display a listing of all city pages.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = CityPage::query();

            if ($request->has('search') && !empty($request->query('search'))) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('country', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_published')) {
                $query->where('is_published', $request->query('is_published'));
            }

            $cityPages = $query->orderBy('id', 'desc')
                ->paginate($request->query('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'City pages retrieved successfully',
                'data' => $cityPages,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve city pages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a listing of published city pages.
     */
    public function published(Request $request): JsonResponse
    {
        try {
            $cityPages = CityPage::where('is_published', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Published city pages retrieved successfully',
                'data' => $cityPages,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve published city pages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific city page.
     */
    public function show(CityPage $cityPage): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'City page retrieved successfully',
                'data' => $cityPage,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve city page',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific city page by slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $cityPage = CityPage::where('slug', $slug)
                ->where('is_published', true)
                ->first();

            if (!$cityPage) {
                return response()->json([
                    'success' => false,
                    'message' => 'City page not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'City page retrieved successfully',
                'data' => $cityPage,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve city page',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created city page.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:city_pages,slug',
                'country' => 'required|string|max:255',
                'country_slug' => 'required|string|max:255',
                'hero_badge' => 'nullable|string|max:255',
                'hero_title' => 'required|string|max:255',
                'hero_highlight' => 'required|string|max:255',
                'hero_lead' => 'nullable|string',
                'hero_bottom_title' => 'nullable|string|max:255',
                'travel_info' => 'nullable|json',
                'steps' => 'nullable|json',
                'documents' => 'nullable|json',
                'highlights' => 'nullable|json',
                'faqs' => 'nullable|json',
                'partners_description' => 'nullable|string',
                'cta_title' => 'nullable|string|max:255',
                'cta_description' => 'nullable|string',
                'cta_primary_text' => 'nullable|string|max:255',
                'cta_secondary_text' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'is_published' => 'required|in:0,1,true,false',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = $this->generateSlug($validated['name']);
            }

            // Cast is_published to boolean
            $validated['is_published'] = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);

            // Decode JSON fields
            foreach (['travel_info', 'steps', 'documents', 'highlights', 'faqs'] as $jsonField) {
                if (isset($validated[$jsonField]) && is_string($validated[$jsonField])) {
                    $validated[$jsonField] = json_decode($validated[$jsonField], true);
                }
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('img/cities'), $imageName);
                $validated['image'] = $imageName;
            }

            $cityPage = CityPage::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'City page created successfully',
                'data' => $cityPage,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], StatusCodes::BAD_REQUEST);
        } catch (\Exception $e) {
            \Log::error('CityPage Create Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create city page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Update a specific city page.
     */
    public function update(Request $request, CityPage $cityPage): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'slug' => 'nullable|string|max:255|unique:city_pages,slug,' . $cityPage->id,
                'country' => 'sometimes|string|max:255',
                'country_slug' => 'sometimes|string|max:255',
                'hero_badge' => 'nullable|string|max:255',
                'hero_title' => 'sometimes|string|max:255',
                'hero_highlight' => 'sometimes|string|max:255',
                'hero_lead' => 'nullable|string',
                'hero_bottom_title' => 'nullable|string|max:255',
                'travel_info' => 'nullable',
                'steps' => 'nullable',
                'documents' => 'nullable',
                'highlights' => 'nullable',
                'faqs' => 'nullable',
                'partners_description' => 'nullable|string',
                'cta_title' => 'nullable|string|max:255',
                'cta_description' => 'nullable|string',
                'cta_primary_text' => 'nullable|string|max:255',
                'cta_secondary_text' => 'nullable|string|max:255',
                'meta_description' => 'nullable|string',
                'is_published' => 'sometimes|in:0,1,true,false',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            // Generate slug if name changed but slug not provided
            if (isset($validated['name']) && !isset($validated['slug'])) {
                $validated['slug'] = $this->generateSlug($validated['name'], $cityPage->id);
            }

            // Cast is_published to boolean
            if (isset($validated['is_published'])) {
                $validated['is_published'] = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);
            }

            // Decode JSON fields
            foreach (['travel_info', 'steps', 'documents', 'highlights', 'faqs'] as $jsonField) {
                if (isset($validated[$jsonField]) && is_string($validated[$jsonField])) {
                    $validated[$jsonField] = json_decode($validated[$jsonField], true);
                }
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($cityPage->image && file_exists(public_path('img/cities/' . $cityPage->image))) {
                    unlink(public_path('img/cities/' . $cityPage->image));
                }

                $image = $request->file('image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('img/cities'), $imageName);
                $validated['image'] = $imageName;
            }

            $cityPage->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'City page updated successfully',
                'data' => $cityPage->fresh(),
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update city page',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific city page.
     */
    public function destroy(CityPage $cityPage): JsonResponse
    {
        try {
            // Delete image if exists
            if ($cityPage->image && file_exists(public_path('img/cities/' . $cityPage->image))) {
                unlink(public_path('img/cities/' . $cityPage->image));
            }

            $cityPage->delete();

            return response()->json([
                'success' => true,
                'message' => 'City page deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete city page',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle publication status of a city page.
     */
    public function togglePublish(CityPage $cityPage): JsonResponse
    {
        try {
            $cityPage->update(['is_published' => !$cityPage->is_published]);

            return response()->json([
                'success' => true,
                'message' => 'City page publication status updated successfully',
                'data' => $cityPage->fresh(),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle publication status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a URL-friendly slug from a name.
     */
    private function generateSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);

        $query = CityPage::where('slug', 'LIKE', $slug . '%');
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        $count = $query->count();

        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }
}
