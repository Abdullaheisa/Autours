<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'blog_category_id',
        'title',
        'slug',
        'author',
        'image',
        'image_alt_text',
        'content',
        'meta_description',
        'is_published',
        'published_at',
        'views',
        'tags',
        'author_image',
        'author_linkedin',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        // Self-healing schema: Automatically detect and create columns if missing on the new DB
        try {
            if (!\Illuminate\Support\Facades\Schema::hasColumn('blogs', 'published_at')) {
                \Illuminate\Support\Facades\Schema::table('blogs', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->timestamp('published_at')->nullable();
                });
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('blogs', 'views')) {
                \Illuminate\Support\Facades\Schema::table('blogs', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->integer('views')->default(0);
                });
            }
            if (!\Illuminate\Support\Facades\Schema::hasColumn('blogs', 'tags')) {
                \Illuminate\Support\Facades\Schema::table('blogs', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->text('tags')->nullable();
                });
            }
        } catch (\Exception $e) {
            // Keep silent during setup or when DB connection is not fully initialized
        }
    }

    /**
     * Get the category of this blog
     */
    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }
}

