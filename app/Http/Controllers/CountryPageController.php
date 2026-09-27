<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\CountryPage;
use App\Models\CityPage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CountryPageController extends Controller
{
    /**
     * Display a listing of all country pages.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = CountryPage::query();

            if ($request->has('search') && !empty($request->query('search'))) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_published')) {
                $query->where('is_published', $request->query('is_published'));
            }

            $perPage = $request->query('per_page', 15);
            $countryPages = $query->orderBy('name', 'asc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Country pages retrieved successfully',
                'data' => $countryPages,
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            \Log::error('CountryPage Index Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve country pages',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Display a listing of published country pages.
     */
    public function published(Request $request): JsonResponse
    {
        try {
            $countryPages = CountryPage::where('is_published', true)
                ->orderBy('name', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Published country pages retrieved successfully',
                'data' => $countryPages,
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            \Log::error('CountryPage Published Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve published country pages',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Display a specific country page.
     */
    public function show(CountryPage $countryPage): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Country page retrieved successfully',
                'data' => $countryPage,
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve country page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Display a specific country page by slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $slugLower = strtolower($slug);
            $countryPage = CountryPage::whereRaw('LOWER(slug) = ?', [$slugLower])
                ->where('is_published', true)
                ->first();

            if (!$countryPage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Country page not found',
                ], StatusCodes::NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'message' => 'Country page retrieved successfully',
                'data' => $countryPage,
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            \Log::error('CountryPage ShowBySlug Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve country page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Store a newly created country page.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:country_pages,slug',
                'code' => 'nullable|string|max:10',
                'hero_badge' => 'nullable|string|max:255',
                'hero_title' => 'required|string|max:255',
                'hero_highlight' => 'required|string|max:255',
                'hero_lead' => 'nullable|string',
                'hero_bottom_title' => 'nullable|string|max:255',
                'travel_info' => 'nullable',
                'steps' => 'nullable',
                'documents' => 'nullable',
                'highlights' => 'nullable',
                'faqs' => 'nullable',
                'selected_cities' => 'nullable',
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
            } else {
                $validated['slug'] = Str::slug($validated['slug']);
            }

            // Cast is_published to boolean
            $validated['is_published'] = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);

            // Decode JSON fields
            foreach (['travel_info', 'steps', 'documents', 'highlights', 'faqs', 'selected_cities'] as $jsonField) {
                if (isset($validated[$jsonField]) && is_string($validated[$jsonField])) {
                    $validated[$jsonField] = json_decode($validated[$jsonField], true);
                }
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $image->getClientOriginalName());
                $destinationPath = public_path('img/countries');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                $image->move($destinationPath, $imageName);
                $validated['image'] = $imageName;
            }

            $countryPage = CountryPage::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Country page created successfully',
                'data' => $countryPage->fresh(),
            ], StatusCodes::CREATED);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], StatusCodes::BAD_REQUEST);
        } catch (\Exception $e) {
            \Log::error('CountryPage Create Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create country page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Update a specific country page.
     */
    public function update(Request $request, CountryPage $countryPage): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'slug' => 'nullable|string|max:255|unique:country_pages,slug,' . $countryPage->id,
                'code' => 'nullable|string|max:10',
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
                'selected_cities' => 'nullable',
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
            if (isset($validated['slug']) && !empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['slug']);
            } elseif (isset($validated['name']) && !isset($validated['slug'])) {
                $validated['slug'] = $this->generateSlug($validated['name'], $countryPage->id);
            }

            // Cast is_published to boolean
            if (isset($validated['is_published'])) {
                $validated['is_published'] = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);
            }

            // Decode JSON fields
            foreach (['travel_info', 'steps', 'documents', 'highlights', 'faqs', 'selected_cities'] as $jsonField) {
                if (isset($validated[$jsonField]) && is_string($validated[$jsonField])) {
                    $validated[$jsonField] = json_decode($validated[$jsonField], true);
                }
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($countryPage->image && file_exists(public_path('img/countries/' . $countryPage->image))) {
                    @unlink(public_path('img/countries/' . $countryPage->image));
                }

                $image = $request->file('image');
                $imageName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $image->getClientOriginalName());
                $destinationPath = public_path('img/countries');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                $image->move($destinationPath, $imageName);
                $validated['image'] = $imageName;
            }

            $countryPage->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Country page updated successfully',
                'data' => $countryPage->fresh(),
            ], StatusCodes::SUCCESS);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], StatusCodes::BAD_REQUEST);
        } catch (\Exception $e) {
            \Log::error('CountryPage Update Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update country page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Delete a specific country page.
     */
    public function destroy(CountryPage $countryPage): JsonResponse
    {
        try {
            if ($countryPage->image && file_exists(public_path('img/countries/' . $countryPage->image))) {
                @unlink(public_path('img/countries/' . $countryPage->image));
            }

            $countryPage->delete();

            return response()->json([
                'success' => true,
                'message' => 'Country page deleted successfully',
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete country page',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Toggle publication status of a country page.
     */
    public function togglePublish(CountryPage $countryPage): JsonResponse
    {
        try {
            $countryPage->update(['is_published' => !$countryPage->is_published]);

            return response()->json([
                'success' => true,
                'message' => 'Country page publication status updated successfully',
                'data' => $countryPage->fresh(),
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle publication status',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Generate a URL-friendly slug from a name.
     */
    private function generateSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);

        $query = CountryPage::where('slug', 'LIKE', $slug . '%');
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        $count = $query->count();

        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }
}
