<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    /**
     * Display a listing of all blogs.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Blog::with('category');

            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('blog_category_id', $request->query('category_id'));
            }

            // Filter by published status if provided
            if ($request->has('is_published')) {
                $query->where('is_published', $request->query('is_published'));
            }

            // Paginate results
            $blogs = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'Blogs retrieved successfully',
                'data' => $blogs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blogs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a listing of published blogs.
     */
    public function published(Request $request): JsonResponse
    {
        try {
            $query = Blog::where('is_published', true)->with('category');

            // Filter by category if provided
            if ($request->has('category_id')) {
                $query->where('blog_category_id', $request->query('category_id'));
            }

            $blogs = $query->paginate($request->query('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'Published blogs retrieved successfully',
                'data' => $blogs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve published blogs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific blog.
     */
    public function show(Blog $blog): JsonResponse
    {
        try {
            $blog->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Blog retrieved successfully',
                'data' => $blog,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blog',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display a specific blog by slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        try {
            $blog = Blog::where('slug', $slug)->first();

            if (!$blog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Blog not found',
                ], 404);
            }

            $blog->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Blog retrieved successfully',
                'data' => $blog,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve blog',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created blog.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'blog_category_id' => 'required|exists:blog_categories,id',
                'title' => 'required|string|max:255',
                'slug' => 'sometimes|string|max:255|unique:blogs,slug',
                'author' => 'required|string|max:255|unique:blogs,author',
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image_alt_text' => 'sometimes|string|max:255',
                'content' => 'required|string',
                'meta_description' => 'sometimes|string|max:500',
                'is_published' => 'required|in:0,1',
            ]);

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = $this->generateSlug($validated['title']);
            }

            // Cast is_published to boolean
            $validated['is_published'] = (bool) $validated['is_published'];

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $image_name = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('img/blogs'), $image_name);
                $validated['image'] = $image_name;
            }

            $blog = Blog::create($validated);
            $blog->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Blog created successfully',
                'data' => $blog,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], StatusCodes::BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create blog',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Update a specific blog.
     */
    public function update(Request $request, Blog $blog): JsonResponse
    {
        try {
            $validated = $request->validate([
                'blog_category_id' => 'sometimes|exists:blog_categories,id',
                'title' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string|max:255|unique:blogs,slug,' . $blog->id,
                'author' => 'sometimes|string|max:255|unique:blogs,author,' . $blog->id,
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image_alt_text' => 'sometimes|string|max:255',
                'content' => 'sometimes|string',
                'meta_description' => 'sometimes|string|max:500',
                'is_published' => 'sometimes|in:0,1',
            ]);

            // Generate slug if title changed but slug not provided
            if (isset($validated['title']) && !isset($validated['slug'])) {
                $validated['slug'] = $this->generateSlug($validated['title']);
            }

            // Cast is_published to boolean
            if (isset($validated['is_published'])) {
                $validated['is_published'] = (bool) $validated['is_published'];
            }

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($blog->image && file_exists(public_path('img/blogs/' . $blog->image))) {
                    unlink(public_path('img/blogs/' . $blog->image));
                }

                $image = $request->file('image');
                $image_name = time() . '_' . $image->getClientOriginalName();
                $image->move(public_path('img/blogs'), $image_name);
                $validated['image'] = $image_name;
            }

            $blog->update($validated);
            $blog->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Blog updated successfully',
                'data' => $blog,
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
                'message' => 'Failed to update blog',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific blog.
     */
    public function destroy(Blog $blog): JsonResponse
    {
        try {
            // Delete image if exists
            if ($blog->image && file_exists(public_path('img/blogs/' . $blog->image))) {
                unlink(public_path('img/blogs/' . $blog->image));
            }

            $blog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Blog deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete blog',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle publication status of a blog.
     */
    public function togglePublish(Blog $blog): JsonResponse
    {
        try {
            $blog->update(['is_published' => !$blog->is_published]);
            $blog->load('category');

            return response()->json([
                'success' => true,
                'message' => 'Blog publication status updated successfully',
                'data' => $blog,
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
     * Get blogs by category.
     */
    public function getBlogsByCategory(BlogCategory $category, Request $request): JsonResponse
    {
        try {
            $query = Blog::where('blog_category_id', $category->id);

            // Filter by published status if provided
            if ($request->has('is_published')) {
                $query->where('is_published', $request->query('is_published'));
            }

            $blogs = $query->paginate($request->query('per_page', 15));

            return response()->json([
                'success' => true,
                'message' => 'Category blogs retrieved successfully',
                'category' => $category,
                'data' => $blogs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category blogs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a URL-friendly slug from a title.
     */
    private function generateSlug(string $title): string
    {
        $slug = \Illuminate\Support\Str::slug($title);

        // Ensure uniqueness
        $count = Blog::where('slug', 'LIKE', $slug . '%')->count();

        return $count > 0 ? $slug . '-' . ($count + 1) : $slug;
    }
}

