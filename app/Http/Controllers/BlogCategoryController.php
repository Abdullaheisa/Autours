<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BlogCategoryController extends Controller
{
    /**
     * Display a listing of all blog categories.
     */
    public function index(): JsonResponse
    {
        try {
            $categories = BlogCategory::all();

            return response()->json([
                'success' => true,
                'message' => 'Blog categories retrieved successfully',
                'data' => $categories,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blog categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a listing of active blog categories.
     */
    public function active(): JsonResponse
    {
        try {
            $categories = BlogCategory::where('activation', true)->get();

            return response()->json([
                'success' => true,
                'message' => 'Active blog categories retrieved successfully',
                'data' => $categories,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active blog categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific blog category with its blogs.
     */
    public function show(BlogCategory $blogCategory): JsonResponse
    {
        try {
            $blogCategory->load('blogs');

            return response()->json([
                'success' => true,
                'message' => 'Blog category retrieved successfully',
                'data' => $blogCategory,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blog category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created blog category.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255|unique:blog_categories,title',
                'activation' => 'sometimes|boolean',
            ]);

            $category = BlogCategory::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Blog category created successfully',
                'data' => $category,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a specific blog category.
     */
    public function update(Request $request, BlogCategory $blogCategory): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255|unique:blog_categories,title,' . $blogCategory->id,
                'activation' => 'sometimes|boolean',
            ]);

            $blogCategory->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Blog category updated successfully',
                'data' => $blogCategory,
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
                'message' => 'Failed to update blog category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific blog category.
     */
    public function destroy(BlogCategory $blogCategory): JsonResponse
    {
        try {
            $blogCategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog category deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle activation status of a blog category.
     */
    public function toggleActivation(BlogCategory $blogCategory): JsonResponse
    {
        try {
            $blogCategory->update(['activation' => !$blogCategory->activation]);

            return response()->json([
                'success' => true,
                'message' => 'Blog category activation status updated successfully',
                'data' => $blogCategory,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle activation status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

