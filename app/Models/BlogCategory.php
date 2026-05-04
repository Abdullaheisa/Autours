<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasFactory;

    protected $table = 'blog_categories';

    protected $fillable = [
        'title',
        'activation',
    ];

    protected $casts = [
        'activation' => 'boolean',
    ];

    /**
     * Get the blogs for this category
     */
    public function blogs()
    {
        return $this->hasMany(Blog::class, 'blog_category_id');
    }
}

